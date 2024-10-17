package poker_service

import (
	"time"

	"subtle-team/internal/models/poker_dao"
	"subtle-team/internal/services/user_service"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PokerDTO struct {
	Id                string
	Name              string
	TelegramChatId    int64
	TelegramMessageId int
	CreatorUserId     string
	CreatedBy         int64
	ModifiedBy        int64
}

type NewPokerDTO struct {
	Name                  string
	TelegramChatId        int64
	TelegramMessageId     int
	TelegramUserId        int64
	TelegramUserFirstName string
	TelegramUserLastName  string
	TelegramUsername      string
}

type PokerVoteDTO struct {
	Id         string
	PokerId    string
	UserId     string
	StoryPoint poker_dao.StoryPoint
}

type VotePokerRequestDTO struct {
	TelegramChatId        int64
	TelegramMessageId     int
	TelegramUserId        int64
	TelegramUserFirstName string
	TelegramUserLastName  string
	TelegramUsername      string
	StoryPoint            poker_dao.StoryPoint
}

type PokerService struct {
	pokerDAO     *poker_dao.PokerDAO
	pokerVoteDAO *poker_dao.PokerVoteDAO
	userService  *user_service.UserService
}

func NewPokerService(pokerDAO *poker_dao.PokerDAO, pokerVoteDAO *poker_dao.PokerVoteDAO, userService *user_service.UserService) *PokerService {
	return &PokerService{
		pokerDAO:     pokerDAO,
		pokerVoteDAO: pokerVoteDAO,
		userService:  userService,
	}
}

func (pokerService *PokerService) GetPokerById(pokerId string) (*PokerDTO, error) {
	entityId, err := primitive.ObjectIDFromHex(pokerId)
	if err != nil {
		return nil, err
	}

	entity, err := pokerService.pokerDAO.GetPokerEntityById(entityId)
	if err != nil {
		return nil, err
	}

	poker := mapPokerEntityToPoker(*entity)
	return &poker, nil
}

func (pokerService *PokerService) GetPokerByTelegramChatIdAndMessageId(telegramChatId int64, telegramMessageId int) (*PokerDTO, error) {
	entity, err := pokerService.pokerDAO.GetPokerEntityByTelegramChatIdAndMessageId(telegramChatId, telegramMessageId)
	if err != nil {
		return nil, err
	}

	vote := mapPokerEntityToPoker(*entity)
	return &vote, nil
}

func (pokerService *PokerService) GetPokerVotesAndUsersByPokerId(pokerId string) ([]PokerVoteDTO, []user_service.UserDTO, error) {
	pokerEntityId, err := primitive.ObjectIDFromHex(pokerId)
	if err != nil {
		return []PokerVoteDTO{}, []user_service.UserDTO{}, err
	}

	votesEntities, err := pokerService.pokerVoteDAO.GetPokerVoteEntitiesByPokerId(pokerEntityId)
	if err != nil {
		return []PokerVoteDTO{}, []user_service.UserDTO{}, err
	}

	votes := []PokerVoteDTO{}
	usersIds := []string{}
	for _, voteEntity := range votesEntities {
		votes = append(votes, mapPokerVoteEntityToPokerVote(voteEntity))
		usersIds = append(usersIds, voteEntity.UserId.Hex())
	}

	users, err := pokerService.userService.GetUsersByIds(usersIds)
	if err != nil {
		return []PokerVoteDTO{}, []user_service.UserDTO{}, err
	}

	return votes, users, nil
}

func (pokerService *PokerService) CreatePoker(newPoker NewPokerDTO) (string, error) {
	userId, err := pokerService.userService.CreateUserIfNotExists(user_service.NewUserDTO{
		TelegramUserId: newPoker.TelegramUserId,
		FirstName:      newPoker.TelegramUserFirstName,
		LastName:       newPoker.TelegramUserLastName,
		Username:       newPoker.TelegramUsername,
	})
	if err != nil {
		return "", err
	}

	userEntityId, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return "", err
	}

	newEntity := poker_dao.NewPokerEntity{
		Name:              newPoker.Name,
		TelegramChatId:    newPoker.TelegramChatId,
		TelegramMessageId: newPoker.TelegramMessageId,
		CreatorUserId:     userEntityId,
		CreatedBy:         time.Now().Unix(),
		ModifiedBy:        0,
	}

	entityId, err := pokerService.pokerDAO.CreatePokerEntity(newEntity)
	if err != nil {
		return "", err
	}

	return entityId.Hex(), nil
}

func (pokerService *PokerService) VotePoker(request VotePokerRequestDTO) (pokerId string, voted bool, err error) {
	pokerEntity, err := pokerService.pokerDAO.GetPokerEntityByTelegramChatIdAndMessageId(
		request.TelegramChatId,
		request.TelegramMessageId,
	)
	if err != nil {
		return "", false, err
	}

	pokerId = pokerEntity.Id.Hex()

	userId, err := pokerService.userService.CreateUserIfNotExists(user_service.NewUserDTO{
		TelegramUserId: request.TelegramUserId,
		FirstName:      request.TelegramUserFirstName,
		LastName:       request.TelegramUserLastName,
		Username:       request.TelegramUsername,
	})
	if err != nil {
		return pokerId, false, err
	}

	userEntityId, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return pokerId, false, err
	}

	entity, err := pokerService.pokerVoteDAO.GetPokerVoteEntityByPokerIdAndUserId(pokerEntity.Id, userEntityId)
	if err != nil {
		_, err = pokerService.pokerVoteDAO.CreatePokerVoteEntity(pokerEntity.Id, userEntityId, request.StoryPoint)
		if err != nil {
			return pokerId, false, err
		}

		return pokerId, true, err
	}

	if entity.StoryPoint != request.StoryPoint {
		entity.StoryPoint = request.StoryPoint
		err = pokerService.pokerVoteDAO.UpdatePokerVoteEntity(entity)
		if err != nil {
			return pokerId, false, err
		}

		return pokerId, true, err
	}

	return pokerId, false, nil
}

func mapPokerEntityToPoker(entity poker_dao.PokerEntity) PokerDTO {
	return PokerDTO{
		Id:                entity.Id.Hex(),
		Name:              entity.Name,
		TelegramChatId:    entity.TelegramChatId,
		TelegramMessageId: entity.TelegramMessageId,
		CreatorUserId:     entity.CreatorUserId.Hex(),
		CreatedBy:         entity.CreatedBy,
		ModifiedBy:        entity.ModifiedBy,
	}
}

func mapPokerVoteEntityToPokerVote(entity poker_dao.PokerVoteEntity) PokerVoteDTO {
	return PokerVoteDTO{
		Id:         entity.Id.Hex(),
		PokerId:    entity.PokerId.Hex(),
		StoryPoint: entity.StoryPoint,
		UserId:     entity.UserId.Hex(),
	}
}
