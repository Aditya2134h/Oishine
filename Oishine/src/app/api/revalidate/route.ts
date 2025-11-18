import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json()
    
    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      )
    }

    // Revalidate the specified path
    revalidatePath(path)
    
    console.log(`Revalidated path: ${path}`)
    
    return NextResponse.json({
      success: true,
      message: `Path ${path} revalidated successfully`,
      revalidated: true,
      now: Date.now()
    })
  } catch (error) {
    console.error('Error revalidating path:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    )
  }
}
