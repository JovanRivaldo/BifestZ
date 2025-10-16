import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type")
  if (contentType?.includes("application/json")) {
    return await response.json()
  }
  return { message: "Invalid response from server", status: response.status }
}

export async function POST(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const endpoint = pathname.replace("/api/", "")

  try {
    const body = await request.json()
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      credentials: "include",
    })

    const data = await parseResponse(response)
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const endpoint = pathname.replace("/api/", "")

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    })

    const data = await parseResponse(response)
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const endpoint = pathname.replace("/api/", "")

  try {
    const contentType = request.headers.get("content-type")

    let body
    if (contentType?.includes("multipart/form-data")) {
      body = await request.formData()
    } else {
      body = await request.json()
    }

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
      },
      body: body instanceof FormData ? body : JSON.stringify(body),
      credentials: "include",
    })

    const data = await parseResponse(response)
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const endpoint = pathname.replace("/api/", "")

  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    })

    const data = await parseResponse(response)
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
