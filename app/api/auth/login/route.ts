import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const formBody = new URLSearchParams(body).toString();
        const registrData = await fetch('https://ibronevik.ru/taxi/c/0/api/v1/auth', {
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