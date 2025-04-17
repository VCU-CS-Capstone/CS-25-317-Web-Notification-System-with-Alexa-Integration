// pages/api/exchange-google-code.js

export default async function handler(req, res) {
    const { code } = req.body
  
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    })
  
    const tokenData = await tokenRes.json()
  
    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description })
    }
  
    const accessToken = tokenData.access_token
    const refreshToken = tokenData.refresh_token
  
    // Fetch user info
    const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(r => r.json())
  
    // Fetch calendar events
    const calendarRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
  
    const calendarData = await calendarRes.json()
  
    res.status(200).json({
      access_token: accessToken,
      refresh_token: refreshToken,
      userInfo,
      calendarEvents: calendarData.items || []
    })
  }  