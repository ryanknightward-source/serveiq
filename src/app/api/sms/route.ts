import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://cmeydojjiomkhswilcku.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function twiml(message: string): NextResponse {
  return new NextResponse(
    `<Response><Message>${escapeXml(message)}</Message></Response>`,
    { headers: { 'Content-Type': 'text/xml' } }
  )
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const from = formData.get('From') as string | null
  const body = formData.get('Body') as string | null
  const to = formData.get('To') as string | null

  if (!from || !body || !to) {
    return twiml('Sorry, we couldn\u2019t process your message. Please try again.')
  }

  // Find the business that owns this Twilio number
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('twilio_phone', to)
    .single()

  if (!business) {
    return twiml('Sorry, this number is not configured.')
  }

  // Build system prompt from business config
  const systemPrompt = `You are an AI assistant for ${business.business_name}.
Services: ${business.pricing_info || 'Various services available'}.
Tone: ${business.tone || 'friendly'}.
${business.voice_examples ? `Voice examples: ${business.voice_examples}` : ''}
Respond naturally and helpfully to customer inquiries. Keep responses concise for SMS (under 160 characters when possible).`

  // Generate AI response
  let aiResponse: string
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: body }],
      system: systemPrompt
    })
    aiResponse = message.content[0].type === 'text'
      ? message.content[0].text
      : 'Thanks for reaching out! We will get back to you shortly.'
  } catch (err) {
    console.error('Anthropic API error:', err)
    aiResponse = 'Thanks for reaching out! We will get back to you shortly.'
  }

  // Save lead to Supabase
  const { data: lead, error: leadError } = await supabase
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

  if (leadError) {
    console.error('Lead insert failed:', leadError)
  }

  // Save conversation (only if lead was created successfully)
  if (lead) {
    const { error: convError } = await supabase.from('conversations').insert([
      { business_id: business.id, lead_id: lead.id, role: 'customer', message: body, channel: 'sms' },
      { business_id: business.id, lead_id: lead.id, role: 'assistant', message: aiResponse, channel: 'sms' }
    ])
    if (convError) {
      console.error('Conversation insert failed:', convError)
    }
  }

  return twiml(aiResponse)
}
