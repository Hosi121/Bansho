package controllers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"

	"github.com/Hosi121/Bansho/chat"
	"golang.org/x/exp/slog"
	"github.com/gin-gonic/gin"
)

// プロンプトテンプレートを保持する構造体
type PromptTemplate struct {
	Template string `json:"prompt_template"`
}

// LoadPrompt - relation_prompt.jsonからプロンプトテンプレートを読み込む
func LoadPrompt(filepath string) (string, error) {
	file, err := os.Open(filepath)
	if err != nil {
		slog.Error("failed to open prompt file", slog.String("file", filepath), slog.String("error", err.Error()))
		return "", err
	}
	defer file.Close()

	var prompt PromptTemplate
	if err := json.NewDecoder(file).Decode(&prompt); err != nil {
		slog.Error("failed to decode prompt file", slog.String("file", filepath), slog.String("error", err.Error()))
		return "", err
	}

	return prompt.Template, nil
}

// CalculateRelation - ドキュメント間の関連性を計算
func CalculateRelation(c *gin.Context) {
	// リクエストボディをパース
	var request struct {
		Doc1 string `json:"doc1"`
		Doc2 string `json:"doc2"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		slog.Error("failed to parse request body", slog.String("error", err.Error()))
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	// プロンプトテンプレートを読み込む
	promptTemplate, err := LoadPrompt("relation_prompt.json")
	if err != nil {
		slog.Error("failed to load prompt template", slog.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load prompt template"})
		return
	}

	// プロンプト生成
	prompt := fmt.Sprintf(promptTemplate, request.Doc1, request.Doc2)

	// Chat API クライアントの初期化
	client := chat.NewChatCompletions(
		"gpt-4",
		os.Getenv("OPENAI_API_KEY"), // 環境変数から API キーを取得
		500,                         // 最大トークン数
		20,                          // タイムアウト (秒)
	)

	// ChatCompletionsで質問を送信
	response, err := client.AskOneQuestion(prompt)
	if err != nil {
		slog.Error("failed to send message to chat API", slog.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to send message to chat API"})
		return
	}

	// 応答をパース
	var result struct {
		Relation float64 `json:"relation"`
	}
	err = json.Unmarshal([]byte(response.Choices[0].Message.Content), &result)
	if err != nil {
		slog.Error("failed to parse API response", slog.String("error", err.Error()))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse API response"})
		return
	}

	slog.Info("calculated relation successfully",
		slog.String("doc1", request.Doc1),
		slog.String("doc2", request.Doc2),
		slog.Float64("relation", result.Relation),
	)

	// 結果を返す
	c.JSON(http.StatusOK, gin.H{
		"relation": result.Relation,
	})
}

