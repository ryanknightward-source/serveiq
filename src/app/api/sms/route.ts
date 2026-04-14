import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://cmeydojjiomkhswilcku.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const from = formData.get('From') as string
  const body = formData.get('Body') as string
  const to = formData.get('To') as string

  // Find the business that owns this Twilio number
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('twilio_phone', to)
    .single()

  if (!business) {
    return new NextResponse('<Response><Message>Sorry, this number is not configured.</Message></Response>', {
      headers: { 'Content-Type': 'text/xml' }
    })
  }

  // Build system prompt from business config
  const systemPrompt = `You are an AI assistant for ${business.business_name}.
Services: ${business.pricing_info || 'Various services available'}.
Tone: ${business.tone || 'friendly'}.
${business.voice_examples ? `Voice examples: ${business.voice_examples}` : ''}
Respond naturally and helpfully to customer inquiries. Keep responses concise for SMS (under 160 characters when possible).`

  // Generate AI response
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [{ role: 'user', content: body }],
    system: systemPrompt
  })

  const aiResponse = message.content[0].type === 'text' ? message.content[0].text : 'Thanks for reaching out! We will get back to you shortly.'

  // Save lead to Supabase
  const { data: lead } = await supabase
    .from('leads')
    .insert({
      business_id: business.id,
      customer_phone: from,
      message: body,
      ai_response: aiResponse,
      channel: 'sms',
      status: 'responded',
      responded_at: new Date().toISOString()
    })
    .select()
    .single()

  // Save conversation
  await supabase.from('conversations').insert([
    { business_id: business.id, lead_id: lead?.id, role: 'customer', message: body, channel: 'sms' },
    { business_id: business.id, lead_id: lead?.id, role: 'assistant', message: aiResponse, channel: 'sms' }
  ])

  // Return TwiML response
  const twiml = `<Response><Message>${aiResponse}</Message></Response>`
  return new NextResponse(twiml, {
    headers: { 'Content-Type': 'text/xml' }
  })
}
