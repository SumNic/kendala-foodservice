import { DayMenu } from "@/app/page"
import { Order } from "@/lib/api"
import { type NextRequest, NextResponse } from "next/server"
import sendOrderNotification from "./notify"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const orderData = data.order
    const menu = data.menu

    const order = {
      b_start_address: "new",
      b_start_datetime: "now",
      b_payment_way: 2,
      b_max_waiting: "630000000",
      b_options: {
        tickets: {
          seats: {
            "123": {
              1: {
                ...orderData,
                createdAt: new Date().toISOString(),
              },
            },
          },
          t_id: {
            "123": "123",
          },
          payment: "123",
        },
      },
    }

    const body = {
      data: JSON.stringify(order),
      token: "0f2a717495eb89243cbb74f6063cf825",
      u_hash:
        "V+1mST3bzXwyadLXUZIbSLmSaFBFBUq8j9s99SjMwdxs67W84ZtlaAlXZBJAS0BIT6sCtV0xM0A7hdMssesdY4mBPPTLYAvrd7gVk3ZPCR0QbBKQXnxT5aDXSW5By+HW",
    }

    const formBody = new URLSearchParams(body).toString()
    const registrData = await fetch("https://ibronevik.ru/taxi/c/0/api/v1/drive", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    })

    const responseData = await registrData.json()

    if (responseData.status === "error") {
      return NextResponse.json({
        success: false,
        error: responseData.message || "Unknown error",
        code: responseData.code || registrData.status,
        data: responseData.data || null,
      })
    }

    // Send notification
    await sendOrderNotification(responseData.data.b_id, orderData, menu, [ 2690, 3290 ])

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")
    const u_hash = searchParams.get("u_hash")

    const body = JSON.stringify({
      token,
      u_hash,
    })

    const registrData = await fetch(`https://ibronevik.ru/taxi/c/0/api/v1/drive/now`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body,
    })

    const responseData = await registrData.json()

    if (responseData.status === "error") {
      return NextResponse.json({
        success: false,
        error: responseData.message || "Unknown error",
        code: responseData.code || registrData.status,
        data: responseData.data || null,
      })
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
      },
      { status: 500 },
    )
  }
}
