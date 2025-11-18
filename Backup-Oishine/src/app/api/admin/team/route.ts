import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const teamMembers = await db.teamMember.findMany({
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: teamMembers
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, role, image, bio, email, instagram, twitter, linkedin } = body;

    if (!name || !role || !image || !bio) {
      return NextResponse.json(
        { success: false, error: 'Name, role, image, and bio are required' },
        { status: 400 }
      );
    }

    const teamMember = await db.teamMember.create({
      data: {
        name,
        role,
        image,
        bio,
        email: email || null,
        instagram: instagram || null,
        twitter: twitter || null,
        linkedin: linkedin || null
      }
    });

    return NextResponse.json({
      success: true,
      data: teamMember
    });
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}