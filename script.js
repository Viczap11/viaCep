// Função para pesquisar o CEP
function pesquisacep(valor) {
  var cep = valor.replace(/\D/g, ""); // Remove caracteres não numéricos
  if (cep != "") {
    var validacep = /^[0-9]{8}$/; // Valida o formato do CEP
    if (validacep.test(cep)) {
      // Limpa os campos enquanto carrega os dados
      document.getElementById("h-logradouro").value = "...";
      document.getElementById("h-bairro").value = "...";
      document.getElementById("h-cidade").value = "...";
      document.getElementById("h-estado").value = "...";

      // Cria um script para buscar dados do CEP via API ViaCEP
      var script = document.createElement("script");
      script.src = "https://viacep.com.br/ws/" + cep + "/json/?callback=meu_callback";
      document.body.appendChild(script);
    } else {
      limpa_formulario();
      alert("Formato de CEP inválido.");
    }
  } else {
    limpa_formulario();
  }
}

// Função callback para lidar com o retorno da API ViaCEP
function meu_callback(conteudo) {
  if (!("erro" in conteudo)) {
    // Exibe as informações do endereço na tela
    document.getElementById("exibicao-historico").innerHTML = `
      <div class='tabela'>
        <table border="1">
          <tr><th>Informação:</th><th>Detalhes</th></tr>
          <tr><td><strong>CEP:</strong></td><td>${conteudo.cep}</td></tr>
          <tr><td><strong>Logradouro:</strong></td><td>${conteudo.logradouro}</td></tr>
          <tr><td><strong>Bairro:</strong></td><td>${conteudo.bairro}</td></tr>
          <tr><td><strong>Cidade:</strong></td><td>${conteudo.localidade}</td></tr>
          <tr><td><strong>Estado:</strong></td><td>${conteudo.uf}</td></tr>
        </table>
      </div>`;
    salvarHistorico(conteudo); // Salva o objeto completo no histórico
  } else {
    limpa_formulario();
    alert("CEP não encontrado.");
  }
}

// Função para limpar os campos do formulário
function limpa_formulario() {
  document.getElementById("logradouro").value = "";
  document.getElementById("bairro").value = "";
  document.getElementById("cidade").value = "";
  document.getElementById("estado").value = "";
}

// Função para buscar endereço a partir do CEP
function buscarEndereco() {
  var cep = document.querySelector("#cep").value.replace(/\D/g, ""); // Remove caracteres não numéricos
  var url = `https://viacep.com.br/ws/${cep}/json/`; // URL da API ViaCEP
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.erro) {
        document.querySelector("#mensagem").innerHTML = "CEP não encontrado";
      } else {
        // Exibe as informações do endereço na tela
        document.querySelector("#mensagem").innerHTML = `
          <div class='tabela'>
            <table border="1">
              <tr><th>Informação:</th><th>Detalhes</th></tr>
              <tr><td><strong>CEP:</strong></td><td>${data.cep}</td></tr>
              <tr><td><strong>Logradouro:</strong></td><td>${data.logradouro}</td></tr>
              <tr><td><strong>Bairro:</strong></td><td>${data.bairro}</td></tr>
              <tr><td><strong>Cidade:</strong></td><td>${data.localidade}</td></tr>
              <tr><td><strong>Estado:</strong></td><td>${data.uf}</td></tr>
            </table>
          </div>`;
        document.querySelector("#cep").value = ""; // Limpa o campo de CEP
        salvarHistorico(data); // Salva o objeto completo no histórico
      }
    })
    .catch(error => {
      document.querySelector("#mensagem").innerHTML = "Ocorreu um erro ao buscar o CEP!";
      console.error("Erro:", error);
    });
}

// Função para buscar CEP a partir de estado, cidade e logradouro
function buscarCep() {
  var estado = document.querySelector("#estado").value.trim();
  var cidade = document.querySelector("#cidade").value.replace(/\s+/g, "%20");
  var logradouro = document.querySelector("#logradouro").value.replace(/\s+/g, "%20");

  if (!estado || !cidade || !logradouro) {
    return alert("Por favor, preencha todos os campos.");
  }

  var url = `https://viacep.com.br/ws/${estado}/${cidade}/${logradouro}/json/`; // URL da API ViaCEP

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.erro) {
        document.querySelector("#mensagem-cep").innerHTML = "CEP não encontrado";
      } else {
        document.querySelector("#mensagem-cep").innerHTML = "";
        data.forEach(item => {
          // Exibe as informações do endereço na tela
          document.querySelector("#mensagem-cep").innerHTML += `
            <div class='tabela'>
              <table border="1">
                <tr><th>Informação:</th><th>Detalhes</th></tr>
                <tr><td><strong>CEP:</strong></td><td>${item.cep}</td></tr>
                <tr><td><strong>Logradouro:</strong></td><td>${item.logradouro}</td></tr>
                <tr><td><strong>Complemento:</strong></td><td>${item.complemento}</td></tr>
                <tr><td><strong>Bairro:</strong></td><td>${item.bairro}</td></tr>
                <tr><td><strong>Localidade:</strong></td><td>${item.localidade}</td></tr>
                <tr><td><strong>Estado:</strong></td><td>${item.uf}</td></tr>
              </table>
            </div>`;
        });

        document.querySelector("#estado").value = "";
        document.querySelector("#cidade").value = "";
        document.querySelector("#logradouro").value = "";

        data.forEach(item => salvarHistorico(item)); // Salva o objeto completo no histórico
      }
    })
    .catch(error => {
      document.querySelector("#mensagem-cep").innerHTML = "Ocorreu um erro ao buscar este endereço!";
      console.error("Erro:", error);
    });
}

// Função para exibir o histórico de endereços
function exibirHistorico() {
  let historico = JSON.parse(localStorage.getItem("historico")) || [];
  let listaHistorico = document.getElementById("historico");
  listaHistorico.innerHTML = "";

  historico.forEach(dadosEndereco => {
    let li = document.createElement("li");
    let a = document.createElement("a");
    a.href = "javascript:void(0);";
    a.onclick = function() {
      document.querySelector("#mensagem").innerHTML = `
        <div class='tabela'>
          <table border="1">
            <tr><th>Informação:</th><th>Detalhes</th></tr>
            <tr><td><strong>CEP:</strong></td><td>${dadosEndereco.cep}</td></tr>
            <tr><td><strong>Logradouro:</strong></td><td>${dadosEndereco.logradouro}</td></tr>
            <tr><td><strong>Bairro:</strong></td><td>${dadosEndereco.bairro}</td></tr>
            <tr><td><strong>Cidade:</strong></td><td>${dadosEndereco.localidade}</td></tr>
            <tr><td><strong>Estado:</strong></td><td>${dadosEndereco.uf}</td></tr>
          </table>
        </div>`;
    };
    // Exibe um resumo do endereço no histórico
    a.textContent = `${dadosEndereco.cep} - ${dadosEndereco.logradouro}, ${dadosEndereco.bairro}, ${dadosEndereco.localidade} - ${dadosEndereco.uf}`;
    li.appendChild(a);
    listaHistorico.appendChild(li);
  });
}

// Função para salvar histórico
function salvarHistorico(dadosEndereco) {
  let historico = JSON.parse(localStorage.getItem("historico")) || [];
  
  // Verifica se o histórico já contém o CEP
  if (!historico.some(item => item.cep === dadosEndereco.cep)) {
    historico.push(dadosEndereco);
    localStorage.setItem("historico", JSON.stringify(historico));
  }
  exibirHistorico(); // Atualiza a exibição do histórico
}

// Função para limpar histórico
function limparHistorico() {
  localStorage.removeItem("historico");
  exibirHistorico(); // Atualiza a exibição do histórico
}

// Função para limpar os campos do formulário e mensagens
function limparCampos() {
  document.getElementById("cep").value = "";
  document.getElementById("cidade").value = "";
  document.getElementById("logradouro").value = "";
  document.getElementById("mensagem").innerHTML = "";
  document.getElementById("mensagem-cep").innerHTML = "";
}

// Função para mudar o estado no formulário
function mudarEstado() {
  var estados = [
    ["Selecione um estado"], ["AC"], ["AL"], ["AP"], ["AM"], ["BA"], ["CE"], ["DF"], ["ES"], ["GO"], ["MA"], ["MT"], ["MS"], ["MG"], ["PA"], ["PB"], ["PR"], ["PE"], ["PI"], ["RN"], ["RS"], ["RJ"], ["RO"], ["RR"], ["SC"], ["SP"], ["SE"], ["TO"]
  ];
  var select = document.querySelector("#estado");
  select.innerHTML = "";

  estados.forEach(estado => {
    let e = document.createElement("option");
    e.text = estado;
    e.value = estado;
    select.appendChild(e);
  });
}

// Função para inicializar as configurações ao carregar a página
window.onload = function () {
  exibirHistorico(); // Exibe o histórico ao carregar
  mudarEstado(); // Adiciona a chamada para mudarEstado, caso deseje carregar estados ao iniciar
};
