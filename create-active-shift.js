// Script to create an active shift for a staff member
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // List all staff members
    const allStaff = await prisma.staff.findMany({
      include: {
        user: true,
      },
    });
    
    console.log('Available staff members:');
    allStaff.forEach((staff, index) => {
      console.log(`${index + 1}. ${staff.user.name} (${staff.position}) - ID: ${staff.id}`);
    });
    
    if (allStaff.length === 0) {
      console.log('No staff members found. Please add staff members first.');
      return;
    }
    
    // Choose the first staff member for this example (you can modify this as needed)
    const selectedStaff = allStaff[0];
    
    console.log(`\nCreating active shift for: ${selectedStaff.user.name} (${selectedStaff.position})`);
    
    // Check if the staff member already has an active shift today
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingShift = await prisma.shift.findFirst({
      where: {
        staffId: selectedStaff.id,
        startTime: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: "ACTIVE"
      }
    });
    
    if (existingShift) {
      console.log(`${selectedStaff.user.name} already has an active shift today.`);
      return;
    }
    
    // Create a new active shift
    const newShift = await prisma.shift.create({
      data: {
        staffId: selectedStaff.id,
        startTime: now,
        endTime: null,
        status: 'ACTIVE'
      }
    });
    
    console.log(`Successfully created active shift for ${selectedStaff.user.name}!`);
    console.log('Shift details:', newShift);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 