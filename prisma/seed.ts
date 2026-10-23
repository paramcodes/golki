import bcrypt from 'bcryptjs'
import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('password123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'demo@golki.dev' },
    update: {},
    create: { email: 'demo@golki.dev', name: 'Demo User', password },
  })

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo' },
    update: {},
    create: { name: 'Demo Workspace', slug: 'demo' },
  })

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } },
    update: {},
    create: { workspaceId: workspace.id, userId: user.id, role: 'admin' },
  })

  const project = await prisma.project.upsert({
    where: { workspaceId_key: { workspaceId: workspace.id, key: 'DEMO' } },
    update: {},
    create: {
      key: 'DEMO',
      name: 'Demo Project',
      type: 'kanban',
      workspaceId: workspace.id,
      leadId: user.id,
    },
  })

  await Promise.all(
    [
      { name: 'bug', color: '#ca3521' },
      { name: 'feature', color: '#1868db' },
      { name: 'improvement', color: '#22a06b' },
    ].map((l) =>
      prisma.label.upsert({
        where: { projectId_name: { projectId: project.id, name: l.name } },
        update: {},
        create: { ...l, projectId: project.id },
      }),
    ),
  )

  const statuses = ['todo', 'in_progress', 'in_review', 'done']
  const priorities = ['highest', 'high', 'medium', 'low', 'lowest']
  const types = ['task', 'bug', 'story']

  for (let i = 1; i <= 12; i++) {
    const key = `DEMO-${i}`
    await prisma.issue.upsert({
      where: { projectId_key: { projectId: project.id, key } },
      update: {},
      create: {
        key,
        title: `Sample issue ${i}`,
        description: `This is a seeded issue number ${i}.`,
        status: statuses[i % statuses.length],
        priority: priorities[i % priorities.length],
        type: types[i % types.length],
        position: i,
        projectId: project.id,
        reporterId: user.id,
        assigneeId: i % 2 === 0 ? user.id : null,
      },
    })
  }

  await prisma.sprint
    .create({
      data: { name: 'Sprint 1', goal: 'Ship MVP', status: 'active', projectId: project.id },
    })
    .catch(() => {})

  console.log('Seed complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
