import 'dotenv/config';
import {
  PrismaClient,
  Role,
  EventType,
  Proficiency,
  SectionType,
} from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.info('🌱 Iniciando seed...');

  // Limpiar datos existentes (opcional)
  await prisma.eventMember.deleteMany();
  await prisma.event.deleteMany();
  await prisma.setlistSong.deleteMany();
  await prisma.setlist.deleteMany();
  await prisma.songSection.deleteMany();
  await prisma.song.deleteMany();
  await prisma.userInstrument.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await prisma.instrument.deleteMany();
  await prisma.organization.deleteMany();

  console.info('📋 Creando organización...');
  const org = await prisma.organization.create({
    data: {
      name: 'Iglesia de Fe y Esperanza',
      slug: 'iglesia-fe-esperanza',
      timezone: 'America/Santo_Domingo',
    },
  });

  console.info('👥 Creando usuarios...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@iglesia.com',
      passwordHash: 'hash_placeholder', // Later replaced with bcrypt
      firstName: 'Juan',
      lastName: 'Pérez',
      role: Role.ADMIN,
      organizationId: org.id,
    },
  });

  const leader = await prisma.user.create({
    data: {
      email: 'leader@iglesia.com',
      passwordHash: 'hash_placeholder',
      firstName: 'María',
      lastName: 'García',
      role: Role.LEADER,
      organizationId: org.id,
    },
  });

  const musician1 = await prisma.user.create({
    data: {
      email: 'guitar@iglesia.com',
      passwordHash: 'hash_placeholder',
      firstName: 'Carlos',
      lastName: 'López',
      role: Role.MUSICIAN,
      organizationId: org.id,
    },
  });

  const musician2 = await prisma.user.create({
    data: {
      email: 'bass@iglesia.com',
      passwordHash: 'hash_placeholder',
      firstName: 'Ana',
      lastName: 'Martínez',
      role: Role.MUSICIAN,
      organizationId: org.id,
    },
  });

  console.info('🎸 Creando instrumentos...');
  const guitar = await prisma.instrument.create({
    data: { name: 'Guitarra Acústica', icon: '🎸' },
  });

  const bass = await prisma.instrument.create({
    data: { name: 'Bajo', icon: '🎸' },
  });

  const keyboard = await prisma.instrument.create({
    data: { name: 'Teclado', icon: '⌨️' },
  });

  const vocals = await prisma.instrument.create({
    data: { name: 'Vocales', icon: '🎤' },
  });

  console.info('🎼 Asignando instrumentos a músicos...');
  await prisma.userInstrument.createMany({
    data: [
      { userId: musician1.id, instrumentId: guitar.id, proficiency: Proficiency.ADVANCED },
      { userId: musician2.id, instrumentId: bass.id, proficiency: Proficiency.INTERMEDIATE },
      { userId: leader.id, instrumentId: vocals.id, proficiency: Proficiency.ADVANCED },
    ],
  });

  console.info('🏷️ Creando categorías...');
  const worship = await prisma.category.create({
    data: {
      name: 'Adoración',
      color: '#FF6B9D',
      organizationId: org.id,
      createdById: leader.id,
    },
  });

  const praise = await prisma.category.create({
    data: {
      name: 'Alabanza',
      color: '#FFA502',
      organizationId: org.id,
      createdById: leader.id,
    },
  });

  console.info('🎵 Creando canciones...');
  const song1 = await prisma.song.create({
    data: {
      title: 'Grande es el Señor',
      author: 'Hillsong Worship',
      originalKey: 'G',
      tempo: 72,
      timeSignature: '4/4',
      durationSeconds: 240,
      content: `{title: Grande es el Señor}
{key: G}
{tempo: 72}

{start_of_verse: Verso 1}
[G]Grande es el Señor, y [Em]digno de [C]alabanza
[G]En la ciudad [Em]de nuestro [C]Dios, [D]su santo [G]monte
{end_of_verse}

{start_of_chorus: Coro}
[G]Cantaré, cantaré
[Em]Cantaré al Señor [C]
[D]Toda mi vida, [G]toda mi vida
{end_of_chorus}`,
      organizationId: org.id,
      createdById: leader.id,
      categories: { connect: [{ id: worship.id }] },
    },
  });

  const song2 = await prisma.song.create({
    data: {
      title: 'Eres Digno',
      author: 'Chris Tomlin',
      originalKey: 'D',
      tempo: 76,
      timeSignature: '4/4',
      durationSeconds: 280,
      content: `{title: Eres Digno}
{key: D}
{tempo: 76}

{start_of_verse}
[D]Eres digno de recibir [A]gloria
[D]Eres digno de recibir [A]honor
[D]Eres digno de recibir el [A]poder
{end_of_verse}`,
      organizationId: org.id,
      createdById: leader.id,
      categories: { connect: [{ id: praise.id }] },
    },
  });

  const song3 = await prisma.song.create({
    data: {
      title: 'Tu Gracia me Basta',
      author: 'Bethel Music',
      originalKey: 'A',
      tempo: 68,
      timeSignature: '4/4',
      durationSeconds: 260,
      content: `{title: Tu Gracia me Basta}
{key: A}
{tempo: 68}

Tu gracia es suficiente para mí`,
      organizationId: org.id,
      createdById: leader.id,
      categories: { connect: [{ id: worship.id }] },
    },
  });

  console.info('📝 Creando setlist...');
  const setlist = await prisma.setlist.create({
    data: {
      title: 'Servicio Domingo 2 de Junio',
      date: new Date('2026-06-02'),
      eventType: EventType.SERVICE,
      notes: 'Servicio principal de la semana',
      organizationId: org.id,
      createdById: leader.id,
    },
  });

  console.info('🎶 Agregando canciones al setlist...');
  await prisma.setlistSong.createMany({
    data: [
      { setlistId: setlist.id, songId: song1.id, position: 1, customKey: 'G', capo: 0 },
      { setlistId: setlist.id, songId: song2.id, position: 2, customKey: 'D', capo: 0 },
      { setlistId: setlist.id, songId: song3.id, position: 3, customKey: 'A', capo: 0 },
    ],
  });

  console.info('📅 Creando evento...');
  const event = await prisma.event.create({
    data: {
      title: 'Servicio Domingo',
      type: EventType.SERVICE,
      date: new Date('2026-06-02'),
      startTime: new Date('2026-06-02T10:00:00'),
      endTime: new Date('2026-06-02T11:30:00'),
      location: 'Templo Principal',
      organizationId: org.id,
      createdById: leader.id,
      setlistId: setlist.id,
    },
  });

  console.info('👤 Asignando músicos al evento...');
  await prisma.eventMember.createMany({
    data: [
      { eventId: event.id, userId: musician1.id, instrumentId: guitar.id },
      { eventId: event.id, userId: musician2.id, instrumentId: bass.id },
      { eventId: event.id, userId: leader.id, instrumentId: vocals.id },
    ],
  });

  console.info('✅ Seed completado exitosamente!');
  console.info(`
📊 Datos creados:
  - 1 Organización
  - 4 Usuarios (1 Admin, 1 Leader, 2 Musicians)
  - 4 Instrumentos
  - 3 Categorías
  - 3 Canciones
  - 1 Setlist con 3 canciones
  - 1 Evento con 3 asignaciones
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
