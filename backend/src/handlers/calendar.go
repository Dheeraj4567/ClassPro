package handlers

import (
	"goscraper/src/helpers"
	"goscraper/src/types"
	"time"
)

func GetCalendar(token string) (*types.CalendarResponse, error) {
	// Use IST timezone for Indian colleges
	location, err := time.LoadLocation("Asia/Kolkata")
	if err != nil {
		// Fallback to UTC if IST loading fails
		location = time.UTC
	}
	
	now := time.Now().In(location)
	scraper := helpers.NewCalendarFetcher(now, token)
	calendar, err := scraper.GetCalendar()

	return calendar, err
}
