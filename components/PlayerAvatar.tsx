"use client"

import { useState, useEffect } from 'react'
import { TEAM_COLOURS, getPlayerInitials } from '@/lib/teams'

interface PlayerAvatarProps {
  name: string
  team: string
  size?: number
  imageUrl?: string
}

export function PlayerAvatar({ name, team, size = 36, imageUrl }: PlayerAvatarProps) {
  const [wikiImg, setWikiImg] = useState<string | null>(null)
  const [imgFailed, setImgFailed] = useState(false)
  const colours = TEAM_COLOURS[team] ?? { primary: '#1a1a1a', secondary: '#333333' }
  const initials = getPlayerInitials(name)

  useEffect(() => {
    if (imageUrl) return
    const encoded = encodeURIComponent(name.replace(/ /g, '_'))
    fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encoded}&prop=pageimages&format=json&pithumbsize=120&origin=*`,
      { cache: 'force-cache' }
    )
      .then(r => r.json())
      .then(data => {
        const pages = data.query?.pages
        if (!pages) return
        const page = pages[Object.keys(pages)[0]]
        if (page?.thumbnail?.source) setWikiImg(page.thumbnail.source)
      })
      .catch(() => {})
  }, [name, imageUrl])

  const finalImg = imageUrl || wikiImg
  const showImage = Boolean(finalImg) && !imgFailed

  const gradient = `linear-gradient(135deg, ${colours.primary} 0%, ${colours.secondary} 100%)`

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: showImage ? colours.primary : gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.33,
      fontWeight: 800,
      color: '#ffffff',
      flexShrink: 0,
      border: '1.5px solid rgba(255,255,255,0.12)',
      letterSpacing: '-0.02em',
      overflow: 'hidden',
      position: 'relative',
      textShadow: '0 1px 2px rgba(0,0,0,0.5)',
    }}>
      {showImage ? (
        <img
          src={finalImg!}
          alt={name}
          onError={() => { setImgFailed(true); setWikiImg(null) }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        initials
      )}
    </div>
  )
}
