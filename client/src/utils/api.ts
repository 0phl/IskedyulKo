const API_BASE_URL = 'http://localhost:5000/api';

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatTime = (time: string): string => {
  return time.substring(0, 5); // Remove seconds from HH:MM:SS
};

// Convert 24-hour time to 12-hour format
export const formatTo12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minutes} ${ampm}`;
};

// Convert 12-hour time back to 24-hour format
export const formatTo24Hour = (time12: string): string => {
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

export const generateTimeSlots = (openTime: string, closeTime: string, duration: number): string[] => {
  const slots: string[] = [];
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
