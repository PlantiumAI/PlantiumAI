import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  timestamp,
  real,
  integer,
  boolean,
  primaryKey,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────

/** Tipo de conta: empresa (administra locais/sensores) ou cliente (acesso restrito). */
export const accountType = pgEnum("account_type", ["empresa", "cliente"]);

/** Tipo de local onde os sensores são instalados. */
export const locationType = pgEnum("location_type", [
  "estufa",
  "plantacao_vertical",
  "container",
]);

/**
 * Tipo do sensor. Define qual dashboard específico é exibido.
 * Métricas espelham o SensorReading do núcleo Rust (desktop).
 */
export const sensorType = pgEnum("sensor_type", [
  "estacao_completa", // dispositivo multi-métrica (ESP32 padrão)
  "soil_moisture",
  "soil_temperature",
  "air_temperature",
  "air_humidity",
  "light_level",
  "co2_level",
  "ph_level",
]);

// ─────────────────────────────────────────────────────────────
// Empresas
// ─────────────────────────────────────────────────────────────

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  address: text("address"),
  // localização geográfica (opcional) — para o mapa dos locais
  latitude: real("latitude"),
  longitude: real("longitude"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─────────────────────────────────────────────────────────────
// Usuários (compatível com Auth.js + campos da plataforma)
// ─────────────────────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    // login único usado nas credenciais (além do e-mail)
    login: varchar("login", { length: 64 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    emailVerified: timestamp("email_verified", { withTimezone: true }),
    image: text("image"),
    // hash de senha (bcrypt) — nulo para contas só-OAuth
    passwordHash: text("password_hash"),
    role: accountType("role").notNull().default("cliente"),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    loginIdx: uniqueIndex("users_login_idx").on(t.login),
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
    companyIdx: index("users_company_idx").on(t.companyId),
  }),
);

// Tabelas padrão do Auth.js (Drizzle adapter) — habilitam OAuth (ex.: Google) no futuro.
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.provider, t.providerAccountId] }),
  }),
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.identifier, t.token] }) }),
);

// ─────────────────────────────────────────────────────────────
// Locais (estufas / plantações verticais / containers)
// ─────────────────────────────────────────────────────────────

export const locations = pgTable(
  "locations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    type: locationType("type").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ companyIdx: index("locations_company_idx").on(t.companyId) }),
);

// ─────────────────────────────────────────────────────────────
// Tokens de dispositivo (firmware ↔ plataforma)
// ─────────────────────────────────────────────────────────────

/**
 * Token gerado no dashboard e gravado no firmware.
 * Guardamos APENAS o hash HMAC (tokenHash); o valor em texto é exibido
 * uma única vez na criação. Identifica o dono (empresa) e o sensor.
 */
export const deviceTokens = pgTable(
  "device_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    // prefixo público (8 chars) p/ identificar o token sem revelar o segredo
    prefix: varchar("prefix", { length: 12 }).notNull(),
    tokenHash: text("token_hash").notNull(),
    label: varchar("label", { length: 120 }),
    revoked: boolean("revoked").notNull().default(false),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    prefixIdx: uniqueIndex("device_tokens_prefix_idx").on(t.prefix),
    companyIdx: index("device_tokens_company_idx").on(t.companyId),
  }),
);

// ─────────────────────────────────────────────────────────────
// Sensores
// ─────────────────────────────────────────────────────────────

export const sensors = pgTable(
  "sensors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    locationId: uuid("location_id").references(() => locations.id, {
      onDelete: "set null",
    }),
    deviceTokenId: uuid("device_token_id").references(() => deviceTokens.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 120 }).notNull(),
    type: sensorType("type").notNull().default("estacao_completa"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    companyIdx: index("sensors_company_idx").on(t.companyId),
    locationIdx: index("sensors_location_idx").on(t.locationId),
  }),
);

// ─────────────────────────────────────────────────────────────
// Leituras (espelham SensorReading do núcleo Rust)
// ─────────────────────────────────────────────────────────────

export const readings = pgTable(
  "readings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sensorId: uuid("sensor_id")
      .notNull()
      .references(() => sensors.id, { onDelete: "cascade" }),
    soilMoisture: real("soil_moisture"),
    airTemperature: real("air_temperature"),
    airHumidity: real("air_humidity"),
    lightLevel: real("light_level"),
    soilTemperature: real("soil_temperature"),
    co2Level: real("co2_level"),
    phLevel: real("ph_level"),
    source: varchar("source", { length: 32 }).notNull().default("firmware"),
    ts: timestamp("ts", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    sensorTsIdx: index("readings_sensor_ts_idx").on(t.sensorId, t.ts),
  }),
);

// ─────────────────────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────────────────────

export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  locations: many(locations),
  sensors: many(sensors),
  deviceTokens: many(deviceTokens),
}));

export const usersRelations = relations(users, ({ one }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
}));

export const locationsRelations = relations(locations, ({ one, many }) => ({
  company: one(companies, {
    fields: [locations.companyId],
    references: [companies.id],
  }),
  sensors: many(sensors),
}));

export const sensorsRelations = relations(sensors, ({ one, many }) => ({
  company: one(companies, {
    fields: [sensors.companyId],
    references: [companies.id],
  }),
  location: one(locations, {
    fields: [sensors.locationId],
    references: [locations.id],
  }),
  deviceToken: one(deviceTokens, {
    fields: [sensors.deviceTokenId],
    references: [deviceTokens.id],
  }),
  readings: many(readings),
}));

export const readingsRelations = relations(readings, ({ one }) => ({
  sensor: one(sensors, {
    fields: [readings.sensorId],
    references: [sensors.id],
  }),
}));

// Tipos inferidos para uso na aplicação
export type Company = typeof companies.$inferSelect;
export type User = typeof users.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type Sensor = typeof sensors.$inferSelect;
export type DeviceToken = typeof deviceTokens.$inferSelect;
export type Reading = typeof readings.$inferSelect;
