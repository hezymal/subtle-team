package user_service

import "fmt"

type UserDTO struct {
	Id             string
	TelegramUserId int64
	FirstName      string
	LastName       string
	Username       string
	CreatedBy      int64
}

func (user *UserDTO) GetFullName() string {
	result := user.FirstName
	if user.LastName != "" {
		result = fmt.Sprintf("%s %s", result, user.LastName)
	}

	if user.Username != "" {
		result = fmt.Sprintf("%s (%s)", result, user.Username)
	}

	return result
}
