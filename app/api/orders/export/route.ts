import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const exportExcelOrderData = await request.json()

    const body = {
      token: exportExcelOrderData.token,
      u_hash: exportExcelOrderData.u_hash,
      is_var: exportExcelOrderData.is_var,
      s_t_data: JSON.stringify(exportExcelOrderData.s_t_data),
    }

    const formBody = new URLSearchParams(body).toString()
    const response = await fetch(
      "https://ibronevik.ru/taxi/c/0/api/v1/script/template/orders_report/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody,
      },
    )

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: "Unknown error",
        data: null,
      })
    }

    const buffer = await response.arrayBuffer()

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="orders_report.xlsx"`,
      },
    })
  } catch (error) {
    console.error(error, "error")
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
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

function isUrgent(order: any): boolean {
  const today = new Date().toDateString()
  return order.orderDays.some((day: any) => new Date(day.date).toDateString() === today)
}
