#!/usr/bin/env npx tsx
/**
 * Downloads AFL player headshots to /public/players/{slug}.png
 * Run: npx tsx scripts/fetch-player-images.ts
 *
 * To find a player's ChampID:
 *   https://aflapi.afl.com.au/afl/v2/players?playerIds=<id>
 *   or inspect the AFL website network tab on a player profile page.
 */

import fs from 'fs'
import path from 'path'
import https from 'https'

// AFL ChampID mapping — update IDs as needed
// Format: 'player-slug': 'CD_I<champId>'
const PLAYER_IDS: Record<string, string> = {
  // Collingwood
  'nick-daicos':       'CD_I1012249',
  'josh-daicos':       'CD_I1010977',
  'scott-pendlebury':  'CD_I290826',
  'jordan-de-goey':    'CD_I993737',
  'steele-sidebottom': 'CD_I272370',
  'darcy-moore':       'CD_I993738',
  'brayden-maynard':   'CD_I993739',

  // Carlton
  'sam-walsh':         'CD_I1005292',
  'patrick-cripps':    'CD_I993592',
  'george-hewett':     'CD_I1005294',
  'matthew-kennedy':   'CD_I993749',

  // GWS Giants
  'tom-green':         'CD_I1010957',
  'jacob-wehr':        'CD_I1021001',
  'lachlan-ash':       'CD_I1010958',
  'callan-ward':       'CD_I272407',
  'jesse-hogan':       'CD_I993745',

  // Sydney
  'errol-gulden':      'CD_I1012245',
  'isaac-heeney':      'CD_I993746',
  'james-rowbottom':   'CD_I1010959',
  'chad-warner':       'CD_I1012246',
  'callum-mills':      'CD_I993747',
  'tom-mccartin':      'CD_I1010960',

  // Geelong
  'tom-stewart':       'CD_I993748',
  'patrick-dangerfield':'CD_I272395',
  'max-holmes':        'CD_I1010961',
  'oliver-henry':      'CD_I1021002',
  'mark-blicavs':      'CD_I993750',

  // Western Bulldogs
  'bailey-smith':      'CD_I1010962',
  'adam-treloar':      'CD_I993751',
  'marcus-bontempelli':'CD_I993752',

  // Adelaide
  'chayce-jones':      'CD_I1010963',
  'rory-laird':        'CD_I993753',
  'jordon-butts':      'CD_I1012248',
  'james-peatling':    'CD_I1021003',
  'ben-keays':         'CD_I993754',
  'shane-mcadam':      'CD_I1010964',

  // St Kilda
  'mattaes-phillipou': 'CD_I1012250',
  'jack-sinclair':     'CD_I993755',
  'rowan-marshall':    'CD_I993756',

  // Brisbane
  'noah-anderson':     'CD_I1010965',
  'cam-rayner':        'CD_I1010966',

  // Hawthorn
  'james-worpel':      'CD_I993757',
  'jai-newcombe':      'CD_I1012251',

  // Fremantle
  'caleb-serong':      'CD_I1010967',
  'andrew-brayshaw':   'CD_I1010968',

  // Melbourne
  'christian-petracca':'CD_I993758',
  'clayton-oliver':    'CD_I993759',
  'max-gawn':          'CD_I272396',

  // Essendon
  'zach-merrett':      'CD_I993760',
  'darcy-parish':      'CD_I1010969',
}

const CDN_BASE = 'https://s.afl.com.au/staticfile/AFL%20Tenant/AFL/Players/ChampIDImages/XSmall'
const OUT_DIR = path.join(process.cwd(), 'public', 'players')

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  console.log(`Created directory: ${OUT_DIR}`)
}

function downloadImage(url: string, dest: string): Promise<boolean> {
  return new Promise(resolve => {
    const file = fs.createWriteStream(dest)
    https.get(url, res => {
      if (res.statusCode === 200) {
        res.pipe(file)
        file.on('finish', () => { file.close(); resolve(true) })
      } else {
        file.close()
        fs.unlink(dest, () => {})
        resolve(false)
      }
    }).on('error', err => {
      file.close()
      fs.unlink(dest, () => {})
      console.error(`  Network error for ${url}: ${err.message}`)
      resolve(false)
    })
  })
}

async function main() {
  console.log(`Downloading ${Object.keys(PLAYER_IDS).length} player headshots...\n`)
  const results = { ok: 0, failed: 0 }

  for (const [slug, champId] of Object.entries(PLAYER_IDS)) {
    const url = `${CDN_BASE}/${champId}.png`
    const dest = path.join(OUT_DIR, `${slug}.png`)

    if (fs.existsSync(dest)) {
      console.log(`  ↷ ${slug} (already exists)`)
      results.ok++
      continue
    }

    const ok = await downloadImage(url, dest)
    if (ok) {
      console.log(`  ✓ ${slug}`)
      results.ok++
    } else {
      console.log(`  ✗ ${slug} — 404 or error (initials fallback will be used)`)
      results.failed++
    }
  }

  console.log(`\nDone. ${results.ok} downloaded, ${results.failed} failed.`)
  console.log('\nNext step: update imageUrl in data/players.ts:')
  console.log('  imageUrl: \'/players/{slug}.png\'')
  console.log('\nPlayers without images will automatically show the initials circle fallback.')
}

main().catch(console.error)
