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
  jsonb,
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

/** Status de conectividade do dispositivo (derivado do último heartbeat). */
export const deviceStatus = pgEnum("device_status", [
  "never_seen",
  "online",
  "offline",
]);

/** Tipo de atuador controlável pela plataforma. */
export const actuatorType = pgEnum("actuator_type", [
  "pump", // bomba d'água
  "valve", // válvula solenoide
  "fan", // ventilação
  "exhaust", // exaustão
  "led_panel", // painel de LED (fotoperíodo)
  "relay", // relé genérico
  "heater", // aquecedor
]);

/** Ciclo de vida de um comando cloud → device. */
export const commandStatus = pgEnum("command_status", [
  "pending", // criado, aguardando o device buscar
  "sent", // entregue ao device (aguardando ack)
  "acked", // executado com sucesso
  "failed", // device reportou falha
  "expired", // não coletado dentro do prazo
]);

/** Severidade de alerta persistido. */
export const alertSeverity = pgEnum("alert_severity", [
  "info",
  "atencao",
  "critico",
]);

/** Origem de um comando (auditoria). */
export const commandIssuer = pgEnum("command_issuer", ["user", "automation"]);

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
// Dispositivos (ESP32 / gateway físico em uma estufa)
// ─────────────────────────────────────────────────────────────

/**
 * Dispositivo físico (ESP32, ESP32-CAM ou gateway) instalado em um local.
 * Sensores e atuadores pendem dele; o token de firmware o autentica.
 * `status` é derivado de `lastSeenAt` (heartbeat/telemetria).
 */
export const devices = pgTable(
  "devices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    locationId: uuid("location_id").references(() => locations.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 120 }).notNull(),
    model: varchar("model", { length: 40 }).notNull().default("esp32"),
    firmwareVersion: varchar("firmware_version", { length: 40 }),
    status: deviceStatus("status").notNull().default("never_seen"),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    // configuração enviada ao device (intervalo de leitura, limites locais…)
    config: jsonb("config"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    companyIdx: index("devices_company_idx").on(t.companyId),
    locationIdx: index("devices_location_idx").on(t.locationId),
  }),
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
    // device que este token autentica (null = token legado pré-devices)
    deviceId: uuid("device_id").references(() => devices.id, {
      onDelete: "cascade",
    }),
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
    // device físico ao qual o sensor está ligado (null = legado/desktop)
    deviceId: uuid("device_id").references(() => devices.id, {
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
// Atuadores (bombas, válvulas, ventilação, LED…)
// ─────────────────────────────────────────────────────────────

export const actuators = pgTable(
  "actuators",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    locationId: uuid("location_id").references(() => locations.id, {
      onDelete: "set null",
    }),
    deviceId: uuid("device_id")
      .notNull()
      .references(() => devices.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    type: actuatorType("type").notNull(),
    // canal físico no device (pino GPIO / índice de relé / canal PWM)
    channel: integer("channel").notNull().default(0),
    // estado desejado/reportado: on/off + nível 0–100 (PWM, LED dimming)
    isOn: boolean("is_on").notNull().default(false),
    level: integer("level"),
    stateUpdatedAt: timestamp("state_updated_at", { withTimezone: true }),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    companyIdx: index("actuators_company_idx").on(t.companyId),
    deviceIdx: index("actuators_device_idx").on(t.deviceId),
  }),
);

// ─────────────────────────────────────────────────────────────
// Regras de automação (sensor/condição ou horário → ação)
// ─────────────────────────────────────────────────────────────

/**
 * Regra configurável pelo usuário. `trigger` e `action` são jsonb para
 * evoluir sem migração:
 *  trigger sensor:  { kind:"sensor", metric:"soil_moisture", op:"lt", value:30 }
 *  trigger horário: { kind:"schedule", cron:"0 6 * * *" }
 *  action:          { actuatorId, command:"on"|"off"|"set_level", level?, durationS? }
 */
export const automationRules = pgTable(
  "automation_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    locationId: uuid("location_id").references(() => locations.id, {
      onDelete: "cascade",
    }),
    name: varchar("name", { length: 120 }).notNull(),
    enabled: boolean("enabled").notNull().default(true),
    trigger: jsonb("trigger").notNull(),
    action: jsonb("action").notNull(),
    // intervalo mínimo entre disparos (anti-oscilação)
    cooldownS: integer("cooldown_s").notNull().default(300),
    lastFiredAt: timestamp("last_fired_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    companyIdx: index("automation_rules_company_idx").on(t.companyId),
    locationIdx: index("automation_rules_location_idx").on(t.locationId),
  }),
);

// ─────────────────────────────────────────────────────────────
// Comandos (fila cloud → device, coletada por polling/MQTT)
// ─────────────────────────────────────────────────────────────

export const deviceCommands = pgTable(
  "device_commands",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    deviceId: uuid("device_id")
      .notNull()
      .references(() => devices.id, { onDelete: "cascade" }),
    actuatorId: uuid("actuator_id").references(() => actuators.id, {
      onDelete: "cascade",
    }),
    // payload entregue ao firmware: { command:"on"|"off"|"set_level", level?, durationS? }
    command: jsonb("command").notNull(),
    status: commandStatus("status").notNull().default("pending"),
    issuedBy: commandIssuer("issued_by").notNull().default("user"),
    ruleId: uuid("rule_id").references(() => automationRules.id, {
      onDelete: "set null",
    }),
    detail: text("detail"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    ackedAt: timestamp("acked_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (t) => ({
    deviceStatusIdx: index("device_commands_device_status_idx").on(
      t.deviceId,
      t.status,
    ),
  }),
);

// ─────────────────────────────────────────────────────────────
// Alertas persistidos (gerados na ingestão / automação)
// ─────────────────────────────────────────────────────────────

export const alerts = pgTable(
  "alerts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    locationId: uuid("location_id").references(() => locations.id, {
      onDelete: "cascade",
    }),
    sensorId: uuid("sensor_id").references(() => sensors.id, {
      onDelete: "set null",
    }),
    severity: alertSeverity("severity").notNull().default("info"),
    metric: varchar("metric", { length: 40 }),
    value: real("value"),
    message: text("message").notNull(),
    resolved: boolean("resolved").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (t) => ({
    companyIdx: index("alerts_company_idx").on(t.companyId, t.resolved),
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
  devices: many(devices),
  actuators: many(actuators),
  automationRules: many(automationRules),
  alerts: many(alerts),
}));

export const devicesRelations = relations(devices, ({ one, many }) => ({
  company: one(companies, {
    fields: [devices.companyId],
    references: [companies.id],
  }),
  location: one(locations, {
    fields: [devices.locationId],
    references: [locations.id],
  }),
  sensors: many(sensors),
  actuators: many(actuators),
  commands: many(deviceCommands),
  tokens: many(deviceTokens),
}));

export const actuatorsRelations = relations(actuators, ({ one, many }) => ({
  device: one(devices, {
    fields: [actuators.deviceId],
    references: [devices.id],
  }),
  location: one(locations, {
    fields: [actuators.locationId],
    references: [locations.id],
  }),
  commands: many(deviceCommands),
}));

export const deviceCommandsRelations = relations(deviceCommands, ({ one }) => ({
  device: one(devices, {
    fields: [deviceCommands.deviceId],
    references: [devices.id],
  }),
  actuator: one(actuators, {
    fields: [deviceCommands.actuatorId],
    references: [actuators.id],
  }),
  rule: one(automationRules, {
    fields: [deviceCommands.ruleId],
    references: [automationRules.id],
  }),
}));

export const automationRulesRelations = relations(automationRules, ({ one }) => ({
  company: one(companies, {
    fields: [automationRules.companyId],
    references: [companies.id],
  }),
  location: one(locations, {
    fields: [automationRules.locationId],
    references: [locations.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  company: one(companies, {
    fields: [alerts.companyId],
    references: [companies.id],
  }),
  sensor: one(sensors, {
    fields: [alerts.sensorId],
    references: [sensors.id],
  }),
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
  device: one(devices, {
    fields: [sensors.deviceId],
    references: [devices.id],
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
export type Device = typeof devices.$inferSelect;
export type Actuator = typeof actuators.$inferSelect;
export type AutomationRule = typeof automationRules.$inferSelect;
export type DeviceCommand = typeof deviceCommands.$inferSelect;
export type AlertRow = typeof alerts.$inferSelect;
