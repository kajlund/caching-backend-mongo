import { readFile } from 'fs/promises'

import bcrypt from 'bcryptjs'

import log from '../src/utils/log.js'
import db from '../src/db/db.js'

import Cache from '../src/api/caches/cache.model.js'
import Place from '../src/api/places/place.model.js'
import User from '../src/api/users/user.model.js'

const userData = JSON.parse(await readFile(new URL('./users.json', import.meta.url)))
const placeData = JSON.parse(await readFile(new URL('./places.json', import.meta.url)))
const cacheData = JSON.parse(await readFile(new URL('./caches.json', import.meta.url)))

const getDefaultUserId = async () => {
  const user = await User.findOne({ email: 'kaj.lund@gmail.com' }).lean().exec()
  if (!user) {
    throw new Error('Could not find default user')
  }
  return user._id.toString()
}

const seedUsers = async () => {
  try {
    // Clear all
    await User.deleteMany()
    // Hash passwords
    for (let u of userData) {
      u.password = await bcrypt.hash(u.password, 10)
    }
    // Add to DB
    await User.insertMany(userData)
    log.info(`Seeded ${userData.length} users`)
  } catch (err) {
    log.error(err, 'Error seeding users')
  }
}

const seedPlaces = async () => {
  try {
    // Clear all
    await Place.deleteMany()

    // Build data objects from JSON import
    const places = []
    for (const key in placeData) {
      places.push({
        code: parseInt(key, 10),
        nameSv: placeData[key].KUNTANIMISV,
        nameFi: placeData[key].KUNTANIMIFI,
        provinceSv: placeData[key].MAAKUNTANIMISV,
        provinceFi: placeData[key].MAAKUNTANIMIFI,
      })
    }
    // Add to DB
    await Place.insertMany(places)
    log.info(`Seeded ${places.length} places`)
  } catch (err) {
    log.error(err, 'Error seeding places: ')
  }
}

const seedCaches = async () => {
  try {
    // Delete all
    await Cache.deleteMany()
    let userId = await getDefaultUserId()
    let count = 0

    // Loop JSON data and create caceList
    for (const key in cacheData) {
      let placeName = cacheData[key].municipality
      const place = await Place.findOne({ $or: [{ nameSv: placeName }, { nameFi: placeName }] })
      if (!place) {
        log.debug(`No municipality found for value: "${cacheData[key].municipality}" GC: ${cacheData[key].cacheId}`)
      }
      // Verify that GC doesn't exist
      let gc = await Cache.findOne({ gc: cacheData[key].cacheId })
      if (gc) {
        log.info(
          `gc: ${cacheData[key].cacheId} type: ${cacheData[key].cacheType} name; ${cacheData[key].name} coords:
        ${cacheData[key].coords} verified: ${cacheData[key].verifiedCoords} comment:
        ${cacheData[key].notes}`,
        )
      } else {
        // Create new cache and add comment if exists
        let cache = new Cache({
          createdAt: cacheData[key].createdAt,
          updatedAt: cacheData[key].updatedAt,
          gc: cacheData[key].cacheId,
          cacheType: cacheData[key].cacheType,
          name: cacheData[key].name,
          coords: cacheData[key].coords,
          verified: cacheData[key].verifiedCoords,
          placeId: place ? place._id.toString() : null,
          userId: userId,
        })
        // Add note if exists
        if (cacheData[key].notes) {
          cache.comments.push({
            userId,
            comment: cacheData[key].notes,
          })
        }
        // Save cache
        await cache.save()
        count++
      }
    }
    log.info(`Seeded ${count} caches`)
  } catch (err) {
    log.error(err, 'Error seeding caches: ')
  }
}

const seedData = async () => {
  log.info(`Environment: ${process.env.NODE_ENV}`)
  await db.connect()
  try {
    await seedUsers()
    await seedPlaces()
    await seedCaches()
    process.exit(0)
  } catch (err) {
    log.error(err, 'Error importing data: ')
  }
}

seedData()
  .then(() => {
    log.info('Seeding done.')
    process.exit(0)
  })
  .catch((err) => {
    log.error(err)
    process.exit(1)
  })
