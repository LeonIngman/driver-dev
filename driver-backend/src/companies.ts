import { Hono } from 'hono'
import { sql } from './db.js'

const companies = new Hono()

export default companies
