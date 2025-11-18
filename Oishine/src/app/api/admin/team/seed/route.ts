import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Check if team members already exist
    const existingMembers = await db.teamMember.count();
    if (existingMembers > 0) {
      return NextResponse.json({
        success: true,
        message: 'Team members already exist',
        count: existingMembers
      });
    }

    // Seed initial team members
    const teamMembers = [
      {
        name: 'Takeshi Yamamoto',
        role: 'Executive Chef',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
        bio: '20+ years experience in Japanese cuisine',
        email: 'takeshi@oishine.com',
        instagram: '@takeshi_chef',
        twitter: '@takeshi_yamamoto',
        linkedin: null
      },
      {
        name: 'Yuki Tanaka',
        role: 'Head Chef',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
        bio: 'Specialist in sushi and sashimi',
        email: 'yuki@oishine.com',
        instagram: '@yuki_sushi',
        twitter: null,
        linkedin: 'yuki-tanaka'
      },
      {
        name: 'Hiroshi Sato',
        role: 'Sous Chef',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
        bio: 'Expert in ramen and udon',
        email: 'hiroshi@oishine.com',
        instagram: '@hiroshi_ramen',
        twitter: '@hiroshi_sato',
        linkedin: null
      }
    ];

    const createdMembers = await db.teamMember.createMany({
      data: teamMembers
    });

    return NextResponse.json({
      success: true,
      message: 'Team members seeded successfully',
      count: createdMembers.count
    });
  } catch (error) {
    console.error('Error seeding team members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed team members' },
      { status: 500 }
    );
  }
}