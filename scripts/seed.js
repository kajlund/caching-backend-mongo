import { readFile } from 'fs/promises'

import bcrypt from 'bcryptjs'

import log from '../src/utils/log.js'
import db from '../src/db/db.js'

import Cache from '../src/api/caches/cache.model.js'
import Comment from '../src/api/comments/comment.model.js'
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
    const caches = []
    // Loop JSON data and create caceList
    for (const key in cacheData) {
      let userId = await getDefaultUserId()
      let placeName = cacheData[key].municipality
      const place = await Place.findOne({ $or: [{ nameSv: placeName }, { nameFi: placeName }] })
      if (!place) {
        log.debug(`No municipality found for value: "${cacheData[key].municipality}" GC: ${cacheData[key].cacheId}`)
      }
      let gc = await Cache.findOne({ gc: cacheData[key].cacheId })
      if (gc) {
        log.info(
          `gc: ${cacheData[key].cacheId} type: ${cacheData[key].cacheType} name; ${cacheData[key].name} coords:
        ${cacheData[key].coords} verified: ${cacheData[key].verifiedCoords} comment:
        ${cacheData[key].notes}`,
        )
      } else {
        caches.push({
          createdAt: cacheData[key].createdAt,
          updatedAt: cacheData[key].updatedAt,
          gc: cacheData[key].cacheId,
          cacheType: cacheData[key].cacheType,
          name: cacheData[key].name,
          coords: cacheData[key].coords,
          verified: cacheData[key].verifiedCoords,
          place: place ? place._id.toString() : null,
          user: userId,
          comments: cacheData[key].notes ? cacheData[key].notes : '',
        })
      }
    }
    await Cache.insertMany(caches)
    log.info(`Seeded ${caches.length} caches`)
  } catch (err) {
    log.error(err, 'Error seeding caches: ')
  }
}

const seedComments = async () => {
  try {
    // Delete all
    await Comment.deleteMany()
    const comments = []
    let userId = await getDefaultUserId()
    // Loop JSON data and create commentlist
    for (const key in cacheData) {
      let note = cacheData[key].notes
      if (note) {
        let cache = await Cache.findOne({ gc: cacheData[key].cacheId }).lean().exec()
        if (!cache) {
          log.debug(`No cache found for gc: "${key}"`)
        } else {
          comments.push({
            cache: cache._id.toString(),
            user: userId,
            comment: note,
            createdAt: cacheData[key].createdAt,
            updatedAt: cacheData[key].updatedAt,
          })
        }
      }
    }
    await Comment.insertMany(comments)
    log.info(`Seeded ${comments.length} comments`)
  } catch (err) {
    log.error(err, 'Error seeding comments: ')
  }
}

const seedData = async () => {
  log.info(`Environment: ${process.env.NODE_ENV}`)
  await db.connect()
  try {
    await seedUsers()
    await seedPlaces()
    await seedCaches()
    await seedComments()
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
