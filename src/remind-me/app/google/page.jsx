"use client";

import { useEffect } from "react";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://ialcoyyfwycdaldjdpyo.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbGNveXlmd3ljZGFsZGpkcHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEwMTExNjksImV4cCI6MjA0NjU4NzE2OX0.YLERwCV9-YqBquazVPjXwiLM_acNLN-pkg92Mr23Sos'
)

const CLIENT_ID = '893191240070-9uhdm7f1709lfsklqpq0qmk3bg8ql386.apps.googleusercontent.com'
const REDIRECT_URI = 'https://localhost:3000'
const SCOPES = 'https://www.googleapis.com/auth/calendar'


const GoogleAuth = () => {
    useEffect(() => {
      const hash = window.location.hash
      if (!hash.includes('access_token')) return
  
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
  
      const handleGoogleData = async () => {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }).then((res) => res.json())
  
        // Store user + token in Supabase
        await supabase.from('google').upsert(
          {
            id: userInfo.id,
            email: userInfo.email,
            access_token: accessToken,
          },
          { onConflict: 'id' }
        )
  
        // Fetch calendar events
        const calendarRes = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        const calendarData = await calendarRes.json()
  
        // !!!!!!Store events in Supabase - not yet configured for our specific table setup for events
        // need to copy layout from RedirectButton file in components folder
        const eventsToInsert = (calendarData.items || []).map((event) => ({
          id: event.id,
          user_id: userInfo.id,
          summary: event.summary || '',
          start_time: event.start?.dateTime || event.start?.date,
          end_time: event.end?.dateTime || event.end?.date,
        }))
  
        if (eventsToInsert.length) {
          await supabase.from('calendar_events').upsert(eventsToInsert, { onConflict: 'id' })
        }
  
        alert(`Fetched and stored ${eventsToInsert.length} events for ${userInfo.email}`)
        window.history.replaceState({}, document.title, window.location.pathname)
      }
  
      handleGoogleData()
    }, [])
  
    const handleGoogleRedirect = () => {
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&response_type=token&scope=${encodeURIComponent(SCOPES)}`
      window.location.href = authUrl
    }
  
    return <button onClick={handleGoogleRedirect}>Sign in with Google Here</button>
  }

export default GoogleAuth;