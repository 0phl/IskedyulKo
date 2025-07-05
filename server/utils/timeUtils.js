// Convert 24-hour time to 12-hour format
const formatTo12Hour = (time24) => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minutes} ${ampm}`;
};

// Generate time slots in 12-hour format
const generateTimeSlots = (openTime, closeTime, duration) => {
  const slots = [];
  const start = new Date(`2000-01-01T${openTime}`);
  const end = new Date(`2000-01-01T${closeTime}`);
  
  let current = new Date(start);
  
  while (current < end) {
    const timeString24 = current.toTimeString().substring(0, 5);
    const timeString12 = formatTo12Hour(timeString24);
    slots.push(timeString12);
    current.setMinutes(current.getMinutes() + duration);
  }
  
  return slots;
};

// Convert 12-hour time back to 24-hour format for database storage
const formatTo24Hour = (time12) => {
  const [time, ampm] = time12.split(' ');
  const [hours, minutes] = time.split(':');
  let hour = parseInt(hours);
  
  if (ampm === 'AM' && hour === 12) {
    hour = 0;
  } else if (ampm === 'PM' && hour !== 12) {
    hour += 12;
  }
  
  return `${hour.toString().padStart(2, '0')}:${minutes}`;
};

module.exports = {
  formatTo12Hour,
  formatTo24Hour,
  generateTimeSlots
};
