"use client";

import { useEffect } from "react";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, //'https://ialcoyyfwycdaldjdpyo.supabase.co', // change to .env?
    process.env.NEXT_PUBLIC_SUPABASE_API_KEY//'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbGNveXlmd3ljZGFsZGpkcHlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEwMTExNjksImV4cCI6MjA0NjU4NzE2OX0.YLERwCV9-YqBquazVPjXwiLM_acNLN-pkg92Mr23Sos'
)

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID //'893191240070-9uhdm7f1709lfsklqpq0qmk3bg8ql386.apps.googleusercontent.com'
const REDIRECT_URI = 'https://remind-me-rho-orpin.vercel.app/google'
const SCOPES = 'https://www.googleapis.com/auth/calendar'

//const userId = localStorage.getItem('userId')

const GoogleAuth = () => {


    useEffect(() => {
      //const hash = window.location.hash
      //if (!hash.includes('access_token')) return
  
      //const params = new URLSearchParams(hash.substring(1))
      //const accessToken = params.get('access_token')

      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const userId = localStorage.getItem('id')

      if (!code || !userId) return // if we don't get code or the userId doesnt exist

      const handleGoogleData = async () => {
        //const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          //headers: { Authorization: `Bearer ${accessToken}` },
        //}).then((res) => res.json())

        try {
          const res = await fetch('/api/exchange_code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          })

          const {
            access_token,
            refresh_token,
            userInfo,
            calendarEvents
          } = await res.json()

          //Link Google Info to Logged-in user via userId
          await supabase.from('google').upsert(
            {
              id: userInfo.id,
              email: userInfo.email,
              access_token,
              refresh_token,
              user_id: userId
            },
            { onConflict: 'id' }
          )

          const splitDateTime = (dateTimeStr) => {
            if (!dateTimeStr) return { date: null, time: null }

            const dateTime = new Date(dateTimeStr)

            const date = dateTime.toISOString().split('T')[0]
            const time = dateTime.toTimeString().split(' ')[0]

            return { date, time }
          }

          const insertEvents = (calendarEvents || []).map((event => {
            const start = event.start?.dateTime || event.start?.date
            const end = event.end?.dateTime || event.end?.date

            const { date: start_date, time: start_time } = splitDateTime(start)
            const { date: end_date, time: end_time } = splitDateTime(end)
            
            return {
              id: event.id,
              user_id: userId,
              event_name: event.summary || '',
              event_date: start_date,
              event_end_date: end_date,
              start_time: start_time,
              end_time: end_time
            }
          }))

          if (insertEvents.length) {
            await supabase.from('events').upsert(insertEvents, { onConflict: 'id' })
          }

          alert('Fetched and stored ${insertEvents.length} events for ${userInfo.email}')
          window.history.replaceState({}, document.title, window.location.pathname)
          localStorage.removeItem('userId')
        
        } catch (err) {
          console.error(err)
          alert('Google login failed.')
        }
  
        // Store user + token in Supabase
        //await supabase.from('google').upsert(
          //{
            //id: userInfo.id,
            //email: userInfo.email,
            //access_token,
            //refresh_token,
            //user_id: userId
          //},
          //{ onConflict: 'id' }
        //)
  
        // Fetch calendar events
        //const calendarRes = await fetch(
          //'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          //{
            //headers: {
              //Authorization: `Bearer ${accessToken}`,
            //},
          //}
        //)
        //const calendarData = await calendarRes.json()
  
        // !!!!!!Store events in Supabase - not yet configured for our specific table setup for events
        // need to copy layout from RedirectButton file in components folder
        //const eventsToInsert = (calendarData.items || []).map((event) => ({
          //id: event.id,
          //user_id: userInfo.id,
          //summary: event.summary || '',
          //start_time: event.start?.dateTime || event.start?.date,
          //end_time: event.end?.dateTime || event.end?.date,
        //}))
  
        //if (eventsToInsert.length) {
          //await supabase.from('calendar_events').upsert(eventsToInsert, { onConflict: 'id' })
        //}
  
        //alert(`Fetched and stored ${eventsToInsert.length} events for ${userInfo.email}`)
        //window.history.replaceState({}, document.title, window.location.pathname)
      }
  
      handleGoogleData()
    }, [])
  
    const handleGoogleRedirect = () => {
      //const { data: { user } } = await supabase.aut
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&response_type=code&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent`
      // response_type=code: authorization code flow to allow for getting the data into supabase
      // access_type=offline: requests a refresh token
      // prompt=consent: forces a consent screen in order to use google everytime
      window.location.href = authUrl
    }
  
    return <button onClick={handleGoogleRedirect}>Sign in with Google Here</button>
  }

export default GoogleAuth;