import { NextResponse } from "next/server"

export async function GET() {
    try {
        const registrData = await fetch(`https://ibronevik.ru/taxi/c/0/api/v1/data?_=${Date.now()}`, {
            method: 'GET',
            cache: 'no-store',
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
            data: JSON.parse(responseData.data.data.lang_vls.dishes[1]),
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