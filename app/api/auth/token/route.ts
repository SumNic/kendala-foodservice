import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const formBody = new URLSearchParams(body).toString();
        const registrData = await fetch('https://ibronevik.ru/taxi/c/0/api/v1/token/authorized', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formBody
        })

        const responseData = await registrData.json();

        if (responseData.status === 'error') {
            return NextResponse.json(
                {
                    success: false,
                    error: responseData.message || 'Unknown error',
                    code: responseData.code || registrData.status,
                    data: responseData.data || null,
                },
            );
        }

        cookies().set("token", responseData.data.token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7 // 7 дней
        });

        cookies().set("hash", responseData.data.u_hash, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24 * 7 // 7 дней
        });

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