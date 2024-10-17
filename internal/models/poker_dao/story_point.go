package poker_dao

import "math"

type StoryPoint string

const (
	STORY_POINT_05      StoryPoint = "STORY_POINT_05"
	STORY_POINT_1       StoryPoint = "STORY_POINT_1"
	STORY_POINT_2       StoryPoint = "STORY_POINT_2"
	STORY_POINT_3       StoryPoint = "STORY_POINT_3"
	STORY_POINT_5       StoryPoint = "STORY_POINT_5"
	STORY_POINT_8       StoryPoint = "STORY_POINT_8"
	STORY_POINT_13      StoryPoint = "STORY_POINT_13"
	STORY_POINT_20      StoryPoint = "STORY_POINT_20"
	STORY_POINT_40      StoryPoint = "STORY_POINT_40"
	STORY_POINT_UNKNOWN StoryPoint = "STORY_POINT_UNKNOWN"
)

var StoryPoints = []StoryPoint{
	STORY_POINT_05,
	STORY_POINT_1,
	STORY_POINT_2,
	STORY_POINT_3,
	STORY_POINT_5,
	STORY_POINT_8,
	STORY_POINT_13,
	STORY_POINT_20,
	STORY_POINT_40,
	STORY_POINT_UNKNOWN,
}

func (storyPoint *StoryPoint) GetTitle() string {
	switch *storyPoint {
	case STORY_POINT_05:
		return "0.5"

	case STORY_POINT_1:
		return "1"

	case STORY_POINT_2:
		return "2"

	case STORY_POINT_3:
		return "3"

	case STORY_POINT_5:
		return "5"

	case STORY_POINT_8:
		return "8"

	case STORY_POINT_13:
		return "13"

	case STORY_POINT_20:
		return "20"

	case STORY_POINT_40:
		return "40"
	}

	return "?"
}

func (storyPoint *StoryPoint) GetValue() float64 {
	switch *storyPoint {
	case STORY_POINT_05:
		return 0.5

	case STORY_POINT_1:
		return 1

	case STORY_POINT_2:
		return 2

	case STORY_POINT_3:
		return 3

	case STORY_POINT_5:
		return 5

	case STORY_POINT_8:
		return 8

	case STORY_POINT_13:
		return 13

	case STORY_POINT_20:
		return 20

	case STORY_POINT_40:
		return 40
	}

	return 0
}

func (storyPoint *StoryPoint) IsValid() bool {
	switch *storyPoint {
	case STORY_POINT_05:
		return true

	case STORY_POINT_1:
		return true

	case STORY_POINT_2:
		return true

	case STORY_POINT_3:
		return true

	case STORY_POINT_5:
		return true

	case STORY_POINT_8:
		return true

	case STORY_POINT_13:
		return true

	case STORY_POINT_20:
		return true

	case STORY_POINT_40:
		return true

	case STORY_POINT_UNKNOWN:
		return true
	}

	return false
}

func GetNearestStoryPointToValue(value float64) StoryPoint {
	nearest := STORY_POINT_05

	for _, current := range StoryPoints {
		if current == STORY_POINT_05 || current == STORY_POINT_UNKNOWN {
			continue
		}

		distanceToNearest := math.Abs(nearest.GetValue() - value)
		distanceToCurrent := math.Abs(current.GetValue() - value)
		if distanceToNearest >= distanceToCurrent {
			nearest = current
		}
	}

	return nearest
}
