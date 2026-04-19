"use client"

import { useState } from 'react'
import { getTeamColour, getPlayerInitials } from '@/lib/teams'

interface PlayerAvatarProps {
  name: string
  team: string
  size?: number
  imageUrl?: string
}

export function PlayerAvatar({ name, team, size = 36, imageUrl }: PlayerAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const bgColor = getTeamColour(team)
  const initials = getPlayerInitials(name)

  const showImage = imageUrl && !imgFailed

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: bgColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.33,
      fontWeight: 800,
      color: '#ffffff',
      flexShrink: 0,
      border: '1px solid rgba(255,255,255,0.1)',
      letterSpacing: '-0.02em',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {showImage ? (
        <img
          src={imageUrl}
          alt={name}
          onError={() => setImgFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
        />
      ) : (
        initials
      )}
    </div>
  )
}
