package prompt

import (
	"encoding/json"
	"fmt"
	"os"

	"log/slog"
)

// PromptTemplate - プロンプトテンプレートの構造体
type PromptTemplate struct {
	Template string `json:"prompt_template"`
}

// ValidatePromptFile - プロンプトファイルが正しいか検証
func ValidatePromptFile(filepath string) {
	file, err := os.Open(filepath)
	if err != nil {
		slog.Error("failed to open prompt file", slog.String("file", filepath), slog.String("error", err.Error()))
		panic(fmt.Sprintf("Prompt file not found or cannot be opened: %s", filepath))
	}
	defer file.Close()

	var prompt PromptTemplate
	if err := json.NewDecoder(file).Decode(&prompt); err != nil {
		slog.Error("failed to decode prompt file", slog.String("file", filepath), slog.String("error", err.Error()))
		panic(fmt.Sprintf("Failed to decode prompt file: %s", filepath))
	}

	slog.Info("prompt file validated successfully", slog.String("file", filepath))
}

