import { NextRequest, NextResponse } from "next/server"

async function requestToCurl(request: Request) {
  const url = request.url
  const method = request.method

  // Заголовки
  const headers = [...request.headers.entries()]
    .map(([key, value]) => `-H "${key}: ${value}"`)
    .join(" ")

  // Тело запроса (raw)
  let body = ""
  try {
    const raw = await request.clone().text()
    if (raw) body = `--data '${raw.replace(/'/g, "'\\''")}'`
  } catch {}

  return `curl -X ${method} ${headers} ${body} "${url}"`
}

export async function POST(request: NextRequest) {
  try {
    const curl = await requestToCurl(request)
    console.log(curl)
    const body = await request.json()
    const formBody = new URLSearchParams(body).toString()
    const registrData = await fetch("https://ibronevik.ru/taxi/c/0/api/v1/data", {
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

export async function GET() {
  try {
    const registrData = await fetch(`https://ibronevik.ru/taxi/c/0/api/v1/data?_=${Date.now()}`, {
      method: "GET",
      cache: "no-store",
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
      data: JSON.parse(responseData.data.data.site_constants.site_online.value),
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
