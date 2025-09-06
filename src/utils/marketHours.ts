export interface MarketHours {
  isOpen: boolean;
  marketName: string;
  nextOpen?: Date;
  nextClose?: Date;
  timezone: string;
}

export class MarketHoursService {
  
  // Check if US market is open (NYSE/NASDAQ)
  static isUSMarketOpen(): MarketHours {
    const now = new Date();
    const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const day = easternTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hours = easternTime.getHours();
    const minutes = easternTime.getMinutes();
    const currentMinutes = hours * 60 + minutes;
    
    // Market hours: 9:30 AM - 4:00 PM ET, Monday to Friday
    const marketOpen = 9 * 60 + 30; // 9:30 AM
    const marketClose = 16 * 60; // 4:00 PM
    
    const isWeekday = day >= 1 && day <= 5;
    const isDuringMarketHours = currentMinutes >= marketOpen && currentMinutes < marketClose;
    
    // Check for major holidays (simplified)
    const isHoliday = this.isUSMarketHoliday(easternTime);
    
    const isOpen = isWeekday && isDuringMarketHours && !isHoliday;
    
    return {
      isOpen,
      marketName: 'US Market (NYSE/NASDAQ)',
      timezone: 'America/New_York',
      ...this.calculateNextOpenClose(easternTime, isOpen)
    };
  }
  
  // Check if China market is open (Shanghai/Shenzhen)
  static isChinaMarketOpen(): MarketHours {
    const now = new Date();
    const chinaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Shanghai"}));
    const day = chinaTime.getDay();
    const hours = chinaTime.getHours();
    const minutes = chinaTime.getMinutes();
    const currentMinutes = hours * 60 + minutes;
    
    // Market hours: 9:30 AM - 11:30 AM and 1:00 PM - 3:00 PM CST, Monday to Friday
    const morningOpen = 9 * 60 + 30; // 9:30 AM
    const morningClose = 11 * 60 + 30; // 11:30 AM
    const afternoonOpen = 13 * 60; // 1:00 PM
    const afternoonClose = 15 * 60; // 3:00 PM
    
    const isWeekday = day >= 1 && day <= 5;
    const isMorningSession = currentMinutes >= morningOpen && currentMinutes < morningClose;
    const isAfternoonSession = currentMinutes >= afternoonOpen && currentMinutes < afternoonClose;
    const isDuringMarketHours = isMorningSession || isAfternoonSession;
    
    const isOpen = isWeekday && isDuringMarketHours;
    
    return {
      isOpen,
      marketName: 'China Market (Shanghai/Shenzhen)',
      timezone: 'Asia/Shanghai',
      ...this.calculateNextOpenClose(chinaTime, isOpen)
    };
  }
  
  // Check if Hong Kong market is open
  static isHKMarketOpen(): MarketHours {
    const now = new Date();
    const hkTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Hong_Kong"}));
    const day = hkTime.getDay();
    const hours = hkTime.getHours();
    const minutes = hkTime.getMinutes();
    const currentMinutes = hours * 60 + minutes;
    
    // Market hours: 9:30 AM - 12:00 PM and 1:00 PM - 4:00 PM HKT, Monday to Friday
    const morningOpen = 9 * 60 + 30; // 9:30 AM
    const morningClose = 12 * 60; // 12:00 PM
    const afternoonOpen = 13 * 60; // 1:00 PM
    const afternoonClose = 16 * 60; // 4:00 PM
    
    const isWeekday = day >= 1 && day <= 5;
    const isMorningSession = currentMinutes >= morningOpen && currentMinutes < morningClose;
    const isAfternoonSession = currentMinutes >= afternoonOpen && currentMinutes < afternoonClose;
    const isDuringMarketHours = isMorningSession || isAfternoonSession;
    
    const isOpen = isWeekday && isDuringMarketHours;
    
    return {
      isOpen,
      marketName: 'Hong Kong Market',
      timezone: 'Asia/Hong_Kong',
      ...this.calculateNextOpenClose(hkTime, isOpen)
    };
  }
  
  // Check if any major market is open (for global data like crypto/forex)
  static isAnyMajorMarketOpen(): boolean {
    return this.isUSMarketOpen().isOpen || 
           this.isChinaMarketOpen().isOpen || 
           this.isHKMarketOpen().isOpen;
  }
  
  // Get all market statuses
  static getAllMarketStatuses(): MarketHours[] {
    return [
      this.isUSMarketOpen(),
      this.isChinaMarketOpen(),
      this.isHKMarketOpen()
    ];
  }
  
  private static isUSMarketHoliday(date: Date): boolean {
    // Simplified holiday check - in production, use a comprehensive holiday API
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // New Year's Day
    if (month === 0 && day === 1) return true;
    
    // Christmas Day
    if (month === 11 && day === 25) return true;
    
    // Independence Day
    if (month === 6 && day === 4) return true;
    
    // Add more holidays as needed
    return false;
  }
  
  private static calculateNextOpenClose(marketTime: Date, isOpen: boolean) {
    // This is a simplified calculation - in production, use more sophisticated logic
    const tomorrow = new Date(marketTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 30, 0, 0);
    
    const today = new Date(marketTime);
    today.setHours(16, 0, 0, 0);
    
    if (isOpen) {
      return { nextClose: today };
    } else {
      return { nextOpen: tomorrow };
    }
  }
}