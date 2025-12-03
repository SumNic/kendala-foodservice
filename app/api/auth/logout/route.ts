import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const registrData = await fetch("https://ibronevik.ru/taxi/c/0/api/v1/logout", {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
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

    const response = NextResponse.json({
      success: true,
      data: responseData,
    })

    // response.cookies.set({
    //     name: "token",
    //     value: "",
    //     maxAge: 0,
    //     path: "/",       // чтобы удалить куки по всему сайту
    //     httpOnly: true,  // совпадает с настройками куки при установке
    //     secure: true,
    //     sameSite: "strict",
    // });

    // response.cookies.set({
    //     name: "hash",
    //     value: "",
    //     maxAge: 0,
    //     path: "/",
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: "strict",
    // });

    cookies().set("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    })
    cookies().set("hash", "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    })

    return response
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
