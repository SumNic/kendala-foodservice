import { type NextRequest, NextResponse } from "next/server"

interface Params { orderId: string }

export async function PATCH(request: NextRequest, { params }: { params: Params }) {
   try {
      const newStatus = await request.json()

      const data = {
         action: 'edit',
         data: JSON.stringify({ b_start_address: newStatus }),
         token: '0f2a717495eb89243cbb74f6063cf825',
         u_hash: 'V+1mST3bzXwyadLXUZIbSLmSaFBFBUq8j9s99SjMwdxs67W84ZtlaAlXZBJAS0BIT6sCtV0xM0A7hdMssesdY4mBPPTLYAvrd7gVk3ZPCR0QbBKQXnxT5aDXSW5By+HW'
      }

      const formBody = new URLSearchParams(data).toString();
      const result = await fetch(`https://ibronevik.ru/taxi/c/0/api/v1/drive/get/${params.orderId}`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: formBody
      })

      const responseData = await result.json();

      if (responseData.status === 'error') {
         return NextResponse.json(
            {
               success: false,
               error: responseData.message || 'Unknown error',
               code: responseData.code || result.status,
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