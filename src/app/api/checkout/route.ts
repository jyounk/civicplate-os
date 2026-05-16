import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tenantSlug, designData, customerName, customerEmail, amount } = body

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amount,
            product_data: {
              name: 'Custom License Plate — ' + tenantSlug,
             description: 'Personalized plate: ' + (designData?.text || ''),
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        tenantSlug,
        customerName,
        customerEmail,
        designData: JSON.stringify(designData),
      },
      success_url: process.env.NEXT_PUBLIC_BASE_URL + '/' + tenantSlug + '/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: process.env.NEXT_PUBLIC_BASE_URL + '/' + tenantSlug + '?cancelled=true',
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}