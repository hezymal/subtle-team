package messages

import (
	"fmt"
	"math"
	"sort"
	"strings"

	"subtle-team/internal/handlers/routes"
	"subtle-team/internal/models/poker_dao"
	"subtle-team/internal/services/poker_service"
	"subtle-team/internal/services/user_service"

	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"
)

func GetNewPokerMessageParams(telegramChatId int64, pokerName string) bot.SendMessageParams {
	text := getMessageTitle(pokerName)
	params := bot.SendMessageParams{
		ChatID:      telegramChatId,
		ParseMode:   "HTML",
		Text:        text,
		ReplyMarkup: getActivePokerKeyboardMarkup(),
	}

	return params
}

func GetPokerVoteMessageParams(poker *poker_service.PokerDTO, votedUsers []user_service.UserDTO) (*bot.EditMessageTextParams, error) {
	var text strings.Builder

	_, err := text.WriteString(getMessageTitle(poker.Name))
	if err != nil {
		return nil, err
	}

	if len(votedUsers) > 0 {
		_, err = text.WriteString("\n\n")
		if err != nil {
			return nil, err
		}

		for _, user := range votedUsers {
			_, err = fmt.Fprintf(&text, "💘 - %s\n", user.GetFullName())
			if err != nil {
				return nil, err
			}
		}

		_, err = fmt.Fprintf(&text, "\nВсего голосов: %d", len(votedUsers))
		if err != nil {
			return nil, err
		}
	}

	params := bot.EditMessageTextParams{
		ChatID:      poker.TelegramChatId,
		MessageID:   poker.TelegramMessageId,
		ParseMode:   "HTML",
		Text:        text.String(),
		ReplyMarkup: getActivePokerKeyboardMarkup(),
	}

	return &params, nil
}

func GetPokerCloseMessageParams(poker poker_service.PokerDTO, votes []poker_service.PokerVoteDTO, votedUsers []user_service.UserDTO) (*bot.EditMessageTextParams, error) {
	var text strings.Builder

	_, err := fmt.Fprintf(&text, "%s\n\n", getMessageTitle(poker.Name))
	if err != nil {
		return nil, err
	}

	if len(votes) == 0 {
		_, err = fmt.Fprintf(&text, "Закрыт")
		if err != nil {
			return nil, err
		}
	} else {
		sort.Sort(poker_service.PokerVotesDTO(votes))

		totalValue := 0.0
		unknownValuesAmount := 0

		for _, vote := range votes {
			var voteUser user_service.UserDTO
			for _, user := range votedUsers {
				if user.Id == vote.UserId {
					voteUser = user
					break
				}
			}

			userName := voteUser.GetFullName()
			storyPointTitle := vote.StoryPoint.GetTitle()
			storyPointValue := vote.StoryPoint.GetValue()

			totalValue += storyPointValue
			if vote.StoryPoint == poker_dao.STORY_POINT_UNKNOWN {
				unknownValuesAmount += 1
			}

			_, err = fmt.Fprintf(&text, "%s - %s\n", storyPointTitle, userName)
			if err != nil {
				return nil, err
			}
		}

		totalVotes := len(votes)
		averageValue := 0.0
		if totalVotes-unknownValuesAmount > 0 {
			averageValue = totalValue / float64(totalVotes-unknownValuesAmount)
		}

		nearestStoryPoint := poker_dao.GetNearestStoryPointToValue(averageValue)

		_, err = fmt.Fprintf(&text, "\nГолосов:             %d\n", totalVotes)
		if err != nil {
			return nil, err
		}

		_, err = fmt.Fprintf(&text, "Среднее:             %.2f\n", averageValue)
		if err != nil {
			return nil, err
		}

		_, err = fmt.Fprintf(&text, "Ближайший:     <strong>%s</strong>", nearestStoryPoint.GetTitle())
		if err != nil {
			return nil, err
		}
	}

	params := bot.EditMessageTextParams{
		ChatID:      poker.TelegramChatId,
		MessageID:   poker.TelegramMessageId,
		ParseMode:   "HTML",
		Text:        text.String(),
		ReplyMarkup: getClosedPokerKeyboardMarkup(poker.Id),
	}

	return &params, nil
}

func getMessageTitle(pokerName string) string {
	return fmt.Sprintf("<strong>Покер: %s</strong>", pokerName)
}

func getActivePokerKeyboardMarkup() models.InlineKeyboardMarkup {
	var firstRow []models.InlineKeyboardButton
	var secondRow []models.InlineKeyboardButton

	rowSize := int(math.Ceil(float64(len(poker_dao.StoryPoints)) / 2.0))

	for index, storyPoint := range poker_dao.StoryPoints {
		title := storyPoint.GetTitle()
		callbackData := fmt.Sprintf("%s %s", routes.POKER_VOTE_CALLBACK_QUERY_PREFIX, storyPoint)

		if index < rowSize {
			firstRow = append(firstRow, models.InlineKeyboardButton{
				Text:         title,
				CallbackData: callbackData,
			})
		} else {
			secondRow = append(secondRow, models.InlineKeyboardButton{
				Text:         title,
				CallbackData: callbackData,
			})
		}
	}

	return models.InlineKeyboardMarkup{
		InlineKeyboard: [][]models.InlineKeyboardButton{
			firstRow,
			secondRow,
			{
				{
					Text:         "Завершить",
					CallbackData: routes.POKER_CLOSE_CALLBACK_QUERY_PREFIX,
				},
			},
		},
	}
}

func getClosedPokerKeyboardMarkup(pokerId string) models.InlineKeyboardMarkup {
	return models.InlineKeyboardMarkup{
		InlineKeyboard: [][]models.InlineKeyboardButton{
			{
				{
					Text:         "Повторить",
					CallbackData: fmt.Sprintf("%s %s", routes.POKER_REPEAT_CALLBACK_QUERY_PREFIX, pokerId),
				},
			},
		},
	}
}
