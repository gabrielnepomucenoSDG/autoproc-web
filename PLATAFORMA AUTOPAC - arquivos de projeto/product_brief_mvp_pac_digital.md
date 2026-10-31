# Product Brief: MVP PAC Digital

## 1. Visão do Produto e Proposta de Valor
**A Dor:** A aplicação dos testes de Processamento Auditivo Central (PAC) exige extensa tabulação manual, cálculos propensos a erros (ex: matriz do SSW) e tempo excessivo gasto na redação do laudo clínico final.
**A Solução:** Um sistema web/desktop enxuto que digitaliza a coleta de dados durante a sessão, executa automaticamente 100% dos cálculos e cruzamentos normativos (por idade/teste), e gera um laudo formatado em PDF/Docx em segundos.
**Proposta de Valor:** Transformar 40 minutos de cálculos e digitação em 1 minuto de revisão, garantindo precisão clínica e devolvendo tempo ao profissional.

## 2. Personas e Papéis (Equipe de 2 Pessoas)
*   **Fonoaudióloga (Product Owner & Subject Matter Expert):** 
    *   *Responsabilidades:* Fornecer e validar as tabelas de referência de normalidade (idade vs. acertos); testar a usabilidade das telas de inserção de dados simulando um atendimento real; homologar a precisão matemática do motor de laudos; definir os textos padrão do relatório.
*   **Desenvolvedor (Tech Lead & Fullstack):** 
    *   *Responsabilidades:* Traduzir as regras de negócio em algoritmos (foco especial no SSW); criar uma interface de entrada de dados rápida (pensada para uso com teclado/mouse durante a sessão); implementar o motor de regras e o gerador de PDF/Docx; garantir o deploy e estabilidade do MVP.

## 3. Escopo Funcional dos 6 Protocolos (MVP)
A interface deve focar em *inputs* numéricos e botões de incremento/decremento rápidos. O áudio continua sendo tocado pelo equipamento padrão da clínica; o software atua apenas no registro e processamento.

*   **Testes Dióticos (Bandinha):**
    *   *Input:* Acertos para Localização (0 a 5) e Memória (0 a 3).
    *   *Cálculo/Regra:* $\ge$ 4/5 (Localização) = Normal; $\ge$ 2/3 (Memória) = Normal.
*   **Fala no Ruído (IPRF / FR):**
    *   *Input:* % do IPRF e % de Acertos no FR (Orelha Direita e Esquerda). Cada erro apontado equivale a -4%.
    *   *Cálculo/Regra:* Diferença absoluta entre IPRF e FR. Se Diferença < 20% = Normal.
*   **Teste Dicótico de Dígitos (TDD):**
    *   *Input:* Acertos/Erros para Integração Binaural e Separação Binaural (OD e OE). 
    *   *Cálculo/Regra:* Integração (cada erro = -2.5% de 100%). Separação (cada erro = -5% de 100%). Comparação automática com matriz de normalidade por faixa etária (ex: 9+ anos $\ge$ 95%).
*   **Processamento Temporal (Freq, Duração e RGDT):**
    *   *Input:* Acertos para Padrão de Frequência e Duração (Murmúrio/Nomeação) com cálculo de %. Para RGDT, input dos limiares (ms) para 500Hz, 1kHz, 2kHz e 4kHz.
    *   *Cálculo/Regra (RGDT):* Média aritmética dos 4 limiares. Se Média $\le$ 10ms = Normal.
*   **PSI / SSI:**
    *   *Input:* Quantidade de acertos (cada acerto = 10%) nas relações 0, -10 e -15 dB para OD e OE.
    *   *Cálculo/Regra:* Comparação direta com o padrão (ex: 0 dB $\ge$ 80% Normal; -15 dB $\ge$ 60% Normal).
*   **SSW (Dissílabos Alternados) - O Core do Motor:**
    *   *Input:* Matriz de erros distribuídos nas colunas (A a H) e categorizações (DNC, DC, ED, ENC, EC).
    *   *Cálculo Quantitativo:* Multiplicador de erros (x 2.5) subtraído de 100% para Direita Competitiva (DC) e Esquerda Competitiva (EC).
    *   *Cálculo Qualitativo:* Algoritmo para Efeito Auditivo, Efeito de Ordem, Inversões e Tipo A. Retornar se a tendência de erro é Significativa ou Não Significativa com base nos limites (ex: Efeito Auditivo de -4 a +4).

## 4. Regras do Motor de Laudos
1.  **Coleta de Metadados:** Formulário inicial com Nome, Idade (crucial para o motor de regras), Data e Profissional.
2.  **Processamento Lógico (Status):** Para cada protocolo concluído, o sistema injeta os inputs na tabela de referência e crava o *Status*: "Normal" ou "Alterado".
3.  **Mapeamento de Habilidades:** Cada teste está amarrado a uma habilidade auditiva (ex: PSI = Figura-Fundo). Se o teste der "Alterado", a habilidade correspondente recebe a flag "Alterado".
4.  **Geração do Documento:**
    *   O sistema compila uma template pré-formatada (baseada no Docx fornecido).
    *   Preenche as tabelas de resultados com os inputs, o % calculado, o Status e o Valor de Referência correspondente à idade do paciente.
    *   Na seção "Conclusão", o sistema lista dinamicamente apenas as habilidades com flag "Alterado".
    *   Exportação final limpa via biblioteca de geração de PDF (ex: jsPDF, Puppeteer) ou Docx (ex: docx.js).

## 5. Critérios de Sucesso do MVP (Até 30/11)
*   **Funcionalidade:** 100% dos cálculos dos 6 protocolos (especialmente SSW e RGDT) validados e idênticos aos cálculos manuais da Fonoaudióloga.
*   **Performance:** Geração do laudo em menos de 5 segundos após a finalização do input de dados.
*   **Validação Real:** Realização de pelo menos 5 simulações de atendimentos clínicos (dados históricos de pacientes) sem nenhum "crash" ou erro de formatação no documento final.
*   **Adoção:** O sistema deve estar sendo usado de forma independente pela Fonoaudióloga no seu dia a dia clínico ao final de novembro.

## 6. Fora do Escopo Inicial (Não fazer agora)
*   Integração com prontuário eletrônico ou sistemas de agendamento de terceiros.
*   Reprodutor de áudio integrado (o áudio continua no CD/MP3 player externo).
*   Módulo financeiro/faturamento de consultas.
*   Protocolos adicionais não listados (ex: MLD, GIN, Dicótico de Consoantes e Vogais).
*   Banco de dados relacional complexo de longo prazo (os dados podem ser mantidos localmente ou em uma estrutura NoSQL simples apenas para gerar o PDF atual).