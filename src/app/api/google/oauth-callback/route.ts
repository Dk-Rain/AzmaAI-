
import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import type { ArchivedItem } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { code, archive } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is missing.' }, { status: 400 });
    }
    if (!archive) {
      return NextResponse.json({ error: 'Archive data is missing.' }, { status: 400 });
    }

    const oauth2Client = new OAuth2Client(
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        // The redirect_uri must match EXACTLY what's in your Google Cloud Console
        // for this OAuth Client ID under "Authorized redirect URIs".
        // For local development, this is typically your localhost address.
        // For production, it would be your app's domain.
        // The 'postmessage' value can be inconsistent.
        process.env.NODE_ENV === 'production' 
          ? 'https://your-production-app-url.com' // You'll need to replace this
          : 'http://localhost:9002'
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // Convert the archive data to a JSON string
    const archiveContent = JSON.stringify(archive, null, 2);
    const fileMetadata = {
      name: 'AzmaAI_Archive.json',
      mimeType: 'application/json',
    };
    const media = {
      mimeType: 'application/json',
      body: archiveContent,
    };

    // Check if the file already exists
    const res = await drive.files.list({
      q: "name='AzmaAI_Archive.json' and trashed=false",
      spaces: 'drive',
      fields: 'files(id)',
    });

    if (res.data.files && res.data.files.length > 0) {
      // File exists, update it
      const fileId = res.data.files[0].id!;
      await drive.files.update({
        fileId: fileId,
        media: media,
      });
    } else {
      // File doesn't exist, create it
      await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
      });
    }


    return NextResponse.json({ 
        success: true, 
        message: 'Archive synced to Google Drive.' 
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  }
}
