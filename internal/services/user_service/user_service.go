package user_service

import (
	"subtle-team/internal/models/user_dao"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type NewUserDTO struct {
	TelegramUserId int64
	FirstName      string
	LastName       string
	Username       string
}

type UserService struct {
	userDAO *user_dao.UserDAO
}

func NewUserService(userDAO *user_dao.UserDAO) *UserService {
	return &UserService{
		userDAO: userDAO,
	}
}

func (userService *UserService) CreateUser(newUser NewUserDTO) (string, error) {
	newEntity := user_dao.NewUserEntity{
		TelegramUserId: newUser.TelegramUserId,
		FirstName:      newUser.FirstName,
		LastName:       newUser.LastName,
		Username:       newUser.Username,
		CreatedBy:      time.Now().Unix(),
	}

	entityId, err := userService.userDAO.CreateUserEntity(newEntity)
	if err != nil {
		return "", err
	}

	return entityId.Hex(), nil
}

func (userService *UserService) CreateUserIfNotExists(newUser NewUserDTO) (string, error) {
	userId, err := userService.GetUserIdByTelegramUserId(newUser.TelegramUserId)
	if err != nil {
		userId, err = userService.CreateUser(NewUserDTO{
			TelegramUserId: newUser.TelegramUserId,
			FirstName:      newUser.FirstName,
			LastName:       newUser.LastName,
			Username:       newUser.Username,
		})
		if err != nil {
			return "", err
		}
	}

	return userId, err
}

func (userService *UserService) GetUserIdByTelegramUserId(telegramUserId int64) (string, error) {
	entity, err := userService.userDAO.GetUserEntityByTelegramUserId(telegramUserId)
	if err != nil {
		return "", err
	}

	return entity.Id.Hex(), nil
}

func (userService *UserService) GetUsersByIds(usersIds []string) ([]UserDTO, error) {
	entitiesIds := []primitive.ObjectID{}
	for _, userId := range usersIds {
		entityId, err := primitive.ObjectIDFromHex(userId)
		if err != nil {
			return []UserDTO{}, err
		}

		entitiesIds = append(entitiesIds, entityId)
	}

	entities, err := userService.userDAO.GetUsersEntitiesByIds(entitiesIds)
	if err != nil {
		return []UserDTO{}, err
	}

	users := []UserDTO{}
	for _, entity := range entities {
		users = append(users, mapUserEntityToUser(entity))
	}

	return users, nil
}

func mapUserEntityToUser(entity user_dao.UserEntity) UserDTO {
	return UserDTO{
		Id:             entity.Id.Hex(),
		TelegramUserId: entity.TelegramUserId,
		FirstName:      entity.FirstName,
		LastName:       entity.LastName,
		Username:       entity.Username,
		CreatedBy:      entity.CreatedBy,
	}
}
