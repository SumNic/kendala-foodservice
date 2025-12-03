import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const formBody = new URLSearchParams(body).toString()

    const registrData = await fetch("https://ibronevik.ru/taxi/c/0/api/v1/drive/now", {
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
