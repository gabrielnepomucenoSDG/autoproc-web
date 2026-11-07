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

## 3. Escopo Funcional e Regras Oficiais dos 6 Protocolos (MVP)
A interface foca em *inputs* numéricos e botões de incremento/decremento rápidos. O áudio continua sendo tocado pelo equipamento padrão da clínica; o software atua no registro, cálculo normativo imediato e geração de laudo.

Hierarquia oficial de seções do laudo clínico:
1. **Testes Dióticos**
2. **Tarefas Monoaurais de Baixa Redundância**
3. **Tarefas de Processamento Temporal**
4. **Tarefas Dicóticas**

---

### 3.1. Testes Dióticos (Bandinha)
*   **Habilidades:** Localização Sonora e Ordenação Temporal.
*   **Inputs:** Acertos para Localização (0 a 5), Memória Verbal (0 a 3) e Memória Não Verbal (0 a 3).
*   **Critérios de Normalidade (Pereira & Schochat, 1993/2013):**
    *   *Localização Sonora:* $\ge$ 4/5 acertos (incluindo obrigatoriamente direita e esquerda).
    *   *Memória Sequencial Verbal (TMSV - /pa/, /ta/, /ca/, /fa/):* $\ge$ 2/3 acertos ($\ge$ 66.7%).
    *   *Memória Sequencial Não Verbal (TMSnV - guizo, agogô, sino, côco):* $\ge$ 2/3 acertos ($\ge$ 66.7%).

### 3.2. Fala no Ruído (IPRF / FR - Monoaural de Baixa Redundância)
*   **Habilidade:** Fechamento Auditivo.
*   **Inputs:** 
    *   % de acertos no IPRF com gravação (OD e OE).
    *   % de acertos no Fala com Ruído (FR) com relação S/R +5 dB (OD e OE). Cada erro = -4% (25 palavras por orelha).
*   **Critérios de Normalidade (Pereira, 2011/2013):**
    *   *IPRF com gravação:* $\ge$ 88% em ambas as orelhas.
    *   *Fala com Ruído (FR):* $\ge$ 72% em ambas as orelhas.
    *   *Diferença Relativa ($|\text{IPRF} - \text{FR}|$):* $< 20\%$ = **Normal**; $\ge 20\%$ = **Alterado**.

### 3.3. PSI / SSI (Mensagem Competitiva Ipsilateral - MCI)
*   **Habilidade:** Figura-Fundo e Associação de Estímulos Auditivos e Visuais.
*   **Inputs:** Acertos de 0 a 10 para cada relação testada em OD e OE (cada acerto = 10%).
*   **Critérios de Normalidade (Pereira, 2011/2013):**
    *   *Relação 0 dB / MCI:* $\ge$ 80% (ambas as orelhas).
    *   *Relação -10 dB / MCI:* $\ge$ 70% (ambas as orelhas).
    *   *Relação -15 dB / MCI:* $\ge$ 60% (ambas as orelhas, sem assimetria de corte).

### 3.4. Processamento Temporal (Freq, Duração e RGDT)
*   **Habilidades:** Ordenação Temporal (Freq/Duração) e Resolução Temporal (RGDT).
*   **Inputs e Regras:**
    *   *Padrão de Frequência (PPS - Auditec):* Acertos em Murmúrio (Humming) e Nomeação. Adultos: $\ge$ 90% = Normal.
    *   *Padrão de Duração (PD - Auditec):* Acertos em Nomeação. Adultos: $\ge$ 83% = Normal.
    *   *RGDT (Random Gap Detection Test - Keith, 2000):* 
        *   Registra o limiar (ms) onde o paciente detecta consistentemente 2 estímulos em 4 frequências: 500 Hz, 1000 Hz, 2000 Hz e 4000 Hz.
        *   Cálculo: $\text{Média} = \frac{\text{Limiar}_{500} + \text{Limiar}_{1k} + \text{Limiar}_{2k} + \text{Limiar}_{4k}}{4}$.
        *   Normalidade: $\text{Média} \le 10\text{ ms}$ = **Normal**; $> 10\text{ ms}$ = **Alterado**.

### 3.5. Teste Dicótico de Dígitos (TDD)
*   **Habilidades:** Integração Binaural (Atenção Livre/Compartilhada) e Separação Binaural (Atenção Direcionada).
*   **Estrutura de Apresentação:**
    *   *Integração Binaural:* 20 apresentações de pares simultâneos = **40 dígitos avaliados por orelha**. Cada erro desconta **-2.5%** de 100%.
    *   *Separação Binaural:* 10 apresentações de pares direcionados à OD (20 dígitos avaliados) e 10 direcionados à OE (20 dígitos avaliados). Cada erro desconta **-5%** de 100%. Total por orelha: **20 itens**.
*   **Tabela de Referência por Idade (Pereira, 2011/2013):**
    *   *Integração Binaural:*
        *   5-6 anos: OD $\ge 81\%$, OE $\ge 74\%$
        *   7-8 anos: OD $\ge 85\%$, OE $\ge 82\%$
        *   $\ge$ 9 anos: OD $\ge 95\%$, OE $\ge 95\%$
        *   $\ge$ 60 anos (audição normal): OD $\ge 78\%$, OE $\ge 78\%$
    *   *Separação Binaural (OD e OE):*
        *   5-6 anos: $\ge 70\%$
        *   7-8 anos: $\ge 75\%$
        *   9-10 anos: $\ge 85\%$
        *   $\ge$ 11 anos: $\ge 91\%$

### 3.6. SSW (Dissílabos Alternados em Português) - O Core do Motor
*   **Habilidades:** Ordenação Temporal, Integração Binaural, Figura-Fundo e Análise Qualitativa de Erros.
*   **Composição Canônica das Colunas (Katz / Pereira & Schochat):**
    *   Itens Ímpares: Col A = DNC, Col B = DC, Col C = EC, Col D = ENC
    *   Itens Pares: Col E = ENC, Col F = EC, Col G = DC, Col H = DNC
    *   *Totais Combinados:*
        *   $\text{DNC} = \text{Col } A + \text{Col } H$
        *   $\text{DC} = \text{Col } B + \text{Col } G$
        *   $\text{EC} = \text{Col } C + \text{Col } F$
        *   $\text{ENC} = \text{Col } D + \text{Col } E$
*   **Cálculo Quantitativo (% Acertos):**
    *   $\text{OD (Direita Competitiva)} = 100\% - (\text{Erros DC} \times 2{,}5\%)$. Normalidade ($\ge 9$ anos): $\ge 90\%$.
    *   $\text{OE (Esquerda Competitiva)} = 100\% - (\text{Erros EC} \times 2{,}5\%)$. Normalidade ($\ge 9$ anos): $\ge 90\%$.
*   **Análise Qualitativa de Tendências:**
    *   *Efeito Auditivo:* $\text{Total OD } (A+B+C+D) - \text{Total OE } (E+F+G+H)$. Normal se entre $-4$ e $+4$.
    *   *Efeito de Ordem:* $\text{Primeiras Palavras } (A+B+E+F) - \text{Segundas Palavras } (C+D+G+H)$. Normal se entre $-3$ e $+3$.
    *   *Inversões:* Total de inversões na ordem de repetição. Normal $\le 1$.
    *   *Tipo A:* Total de erros na primeira palavra competitiva. Normal $\le 3$.

---

## 4. Regras do Motor de Laudos
1.  **Coleta de Metadados:** Formulário inicial com Nome, Idade (crucial para o chaveamento da tabela de normalidade), Data e Profissional.
2.  **Processamento Lógico (Status):** Para cada protocolo concluído, o sistema injeta os inputs na tabela de referência por idade e define o *Status*: "Normal" ou "Alterado".
3.  **Mapeamento de Habilidades:** Cada teste está amarrado a uma habilidade auditiva específica.
4.  **Geração do Documento:**
    *   Compila template pré-formatada (fiel ao modelo oficial `LAUDO FINAL MARIA FERNANDA TORRES.docx`).
    *   Preenche tabelas de resultados com inputs, % calculados, Status e Valor de Referência normativo.
    *   Na seção "Conclusão", lista dinamicamente apenas as habilidades auditivas que obtiveram flag "Alterado".
    *   Exportação final via biblioteca PDF/Docx.

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
*   Banco de dados relacional complexo de longo prazo.