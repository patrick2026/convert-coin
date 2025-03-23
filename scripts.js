// 1. Aguarda o carregamento completo do DOM antes de executar o script
document.addEventListener("DOMContentLoaded", () => {
  // 2. Configurações da API de câmbio
  const API_KEY = "8e71bb605461b4229ae8d743";
  const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/BRL`;

  // 3. Seleção e configuração de elementos da interface
  const elements = {
    form: document.getElementById("converter-form"), // Formulário principal
    amountInput: document.getElementById("amount"), // Campo de entrada do valor
    currencySelect: document.getElementById("currency"), // Seletor de moeda
    descriptionSpan: document.getElementById("description"), // Exibição das cotações
    resultH1: document.getElementById("result"), // Resultado principal
    resultDiv: document.createElement("div"), // Div para detalhes da conversão
  };

  // 4. Configuração do elemento de resultados
  elements.resultDiv.id = "conversion-result";
  elements.resultDiv.style.cssText = `
      margin-top: 1rem;
      text-align: center;
      color: #f1f2f6;
      font-size: 1.25rem;
  `;

  // 5. Adiciona o elemento de resultados ao DOM se o formulário existir
  if (elements.form) elements.form.appendChild(elements.resultDiv);

  // 6. Função para formatação monetária no padrão brasileiro
  const formatarMoeda = (valor) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // 7. Função para resetar toda a interface
  const resetarInterface = () => {
    elements.amountInput.value = ""; // Limpa o campo de valor
    elements.resultDiv.textContent = ""; // Limpa detalhes da conversão
    elements.resultH1.textContent = ""; // Limpa resultado principal
    elements.descriptionSpan.textContent = ""; // Limpa cotações
  };

  // 8. Validação do input em tempo real
  elements.amountInput.addEventListener("input", (e) => {
    const valorOriginal = e.target.value;
    // Remove caracteres não numéricos e múltiplos pontos
    const valorLimpo = valorOriginal.replace(/[^0-9]/g, "");

    // 9. Se houve alteração, mostra alerta e limpa
    if (valorOriginal !== valorLimpo) {
      alert("Apenas números inteiros são permitidos!");
      e.target.value = valorLimpo; // Força valor correto
      elements.resultDiv.textContent = ""; // Limpa resultados parciais
    }
  });

  // 10. Limpeza completa ao focar no campo
  elements.amountInput.addEventListener("focus", () => {
    if (
      elements.amountInput.value !== "" ||
      elements.resultH1.textContent !== ""
    ) {
      resetarInterface(); // Chama função de reset
    }
  });

  // 11. Função para atualizar cotações da API
  const atualizarCotacoes = async () => {
    try {
      const response = await fetch(API_URL); // Faz requisição
      const data = await response.json(); // Converte resposta

      // 12. Se resposta for válida, processa dados
      if (data.result === "success") {
        // Calcula valores invertidos (de BRL para outras moedas)
        elements.descriptionSpan.innerHTML = `
                  1 Dólar = ${formatarMoeda(1 / data.conversion_rates.USD)}<br>
                  1 Euro = ${formatarMoeda(1 / data.conversion_rates.EUR)}<br>
                  1 Libra = ${formatarMoeda(1 / data.conversion_rates.GBP)}
              `;
      }
    } catch (error) {
      console.error("Erro nas cotações:", error);
      elements.descriptionSpan.textContent =
        "Cotações temporariamente indisponíveis";
    }
  };

  // 13. Função principal de conversão
  const handleConversion = async (e) => {
    e.preventDefault(); // Previne comportamento padrão do formulário

    const valor = parseFloat(elements.amountInput.value); // Converte para número
    const moeda = elements.currencySelect.value; // Obtém moeda selecionada

    // 14. Validação básica do input
    if (!valor || isNaN(valor)) {
      alert("Digite um valor válido para conversão");
      return;
    }

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      // 15. Verifica resposta da API
      if (data.result !== "success") throw new Error("Erro na API");

      // 16. Cálculo preciso da taxa
      const taxaConversao = 1 / data.conversion_rates[moeda]; // Inverte a taxa
      const resultado = (valor * taxaConversao).toFixed(2); // Calcula resultado

      // 17. Atualiza interface com resultados
      elements.resultH1.textContent = `${formatarMoeda(resultado)}`;
      elements.resultDiv.textContent = `Taxa aplicada: 1 ${moeda} = ${formatarMoeda(
        taxaConversao
      )}`;
    } catch (error) {
      console.error("Erro na conversão:", error);
      alert("Erro ao processar conversão");
      resetarInterface(); // Limpa tudo em caso de erro
    }
  };

  // 18. Configuração de eventos
  elements.form.addEventListener("submit", handleConversion); // Submissão do formulário

  // 19. Inicialização do sistema
  atualizarCotacoes(); // Primeira carga das cotações
  setInterval(atualizarCotacoes, 300000); // 5 minutos
});
