#!/usr/bin/env node

/**
 * Script para popular o banco de dados com dados aleatórios de pessoas
 * Execute: node populate-database.js
 */

const API_BASE_URL = 'http://192.168.31.75:3000';

// Arrays de dados para gerar registros aleatórios
const nomes = [
    'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Ferreira',
    'Lucia Rodrigues', 'Roberto Alves', 'Fernanda Lima', 'Antonio Pereira', 'Carla Souza',
    'Rafael Mendes', 'Juliana Barbosa', 'Marcos Nascimento', 'Patricia Gomes', 'Diego Martins',
    'Camila Rocha', 'Lucas Carvalho', 'Beatriz Ribeiro', 'Felipe Araujo', 'Gabriela Dias'
];

const sobrenomesEmpresas = [
    'Ltda', 'S.A.', 'Eireli', 'Me', 'Comércio', 'Serviços', 'Tecnologia', 'Consultoria',
    'Construções', 'Indústria', 'Distribuição', 'Importação', 'Exportação', 'Logística'
];

const tiposEmpresa = [
    'Construção Civil', 'Tecnologia da Informação', 'Consultoria Empresarial', 'Comércio Varejista',
    'Indústria Alimentícia', 'Prestação de Serviços', 'Distribuição', 'Importação/Exportação',
    'Logística e Transportes', 'Saúde e Medicina', 'Educação', 'Agronegócio'
];

const cidades = [
    'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 'Brasília',
    'Fortaleza', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre',
    'Belém', 'Goiânia', 'Guarulhos', 'Campinas', 'São Luís'
];

const estados = ['SP', 'RJ', 'MG', 'BA', 'DF', 'CE', 'AM', 'PR', 'PE', 'RS', 'PA', 'GO'];

// Função para gerar CPF aleatório (formato válido)
function gerarCPF() {
    const cpf = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));

    // Cálculo do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += cpf[i] * (10 - i);
    }
    let resto = soma % 11;
    cpf[9] = resto < 2 ? 0 : 11 - resto;

    // Cálculo do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += cpf[i] * (11 - i);
    }
    resto = soma % 11;
    cpf[10] = resto < 2 ? 0 : 11 - resto;

    return cpf.join('').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para gerar CNPJ aleatório (formato válido)
function gerarCNPJ() {
    const cnpj = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));

    // Cálculo do primeiro dígito verificador
    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma = 0;
    for (let i = 0; i < 12; i++) {
        soma += cnpj[i] * pesos1[i];
    }
    let resto = soma % 11;
    cnpj[12] = resto < 2 ? 0 : 11 - resto;

    // Cálculo do segundo dígito verificador
    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    soma = 0;
    for (let i = 0; i < 13; i++) {
        soma += cnpj[i] * pesos2[i];
    }
    resto = soma % 11;
    cnpj[13] = resto < 2 ? 0 : 11 - resto;

    return cnpj.join('').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

// Função para gerar telefone aleatório
function gerarTelefone() {
    const ddd = Math.floor(Math.random() * 90) + 11;
    const numero = Math.floor(Math.random() * 900000000) + 100000000;
    return `(${ddd}) ${numero.toString().slice(0, 5)}-${numero.toString().slice(5)}`;
}

// Função para gerar email aleatório
function gerarEmail(nome) {
    const dominios = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com.br', 'empresa.com.br'];
    const dominio = dominios[Math.floor(Math.random() * dominios.length)];
    const nomeEmail = nome.toLowerCase().replace(/\s+/g, '.');
    return `${nomeEmail}@${dominio}`;
}

// Função para gerar endereço aleatório
function gerarEndereco() {
    const ruas = ['Rua das Flores', 'Avenida Paulista', 'Rua da Consolação', 'Alameda Santos', 'Rua Augusta'];
    const numero = Math.floor(Math.random() * 9999) + 1;
    const cidade = cidades[Math.floor(Math.random() * cidades.length)];
    const estado = estados[Math.floor(Math.random() * estados.length)];
    const cep = Math.floor(Math.random() * 90000000) + 10000000;

    return {
        street: `${ruas[Math.floor(Math.random() * ruas.length)]}, ${numero}`,
        city: cidade,
        state: estado,
        zipCode: cep.toString().replace(/(\d{5})(\d{3})/, '$1-$2')
    };
}

// Função para criar uma pessoa aleatória
function criarPessoaAleatoria() {
    const isPessoaFisica = Math.random() > 0.4; // 60% pessoa física, 40% jurídica

    if (isPessoaFisica) {
        const nome = nomes[Math.floor(Math.random() * nomes.length)];
        return {
            name: nome,
            document: gerarCPF(),
            type: 'client',
            contacts: [
                { type: 'phone', value: gerarTelefone() },
                { type: 'email', value: gerarEmail(nome) }
            ],
            addresses: [gerarEndereco()]
        };
    } else {
        const nomeEmpresa = tiposEmpresa[Math.floor(Math.random() * tiposEmpresa.length)];
        const sobrenome = sobrenomesEmpresas[Math.floor(Math.random() * sobrenomesEmpresas.length)];
        const nomeCompleto = `${nomeEmpresa} ${sobrenome}`;

        return {
            name: nomeCompleto,
            corporateName: nomeCompleto,
            document: gerarCNPJ(),
            type: Math.random() > 0.5 ? 'supplier' : 'client',
            contacts: [
                { type: 'phone', value: gerarTelefone() },
                { type: 'email', value: gerarEmail(nomeCompleto.replace(/\s+/g, '')) }
            ],
            addresses: [gerarEndereco()]
        };
    }
}

// Função para fazer requisição HTTP
async function fazerRequisicao(url, dados) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados)
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Erro na requisição para ${url}:`, error.message);
        throw error;
    }
}

// Função principal
async function popularBanco() {
    console.log('🚀 Iniciando população do banco de dados...\n');

    const quantidadeRegistros = 25;
    let sucessos = 0;
    let erros = 0;

    console.log(`📊 Gerando ${quantidadeRegistros} registros de pessoas...\n`);

    for (let i = 1; i <= quantidadeRegistros; i++) {
        try {
            const pessoa = criarPessoaAleatoria();

            console.log(`📝 Registro ${i}/${quantidadeRegistros}:`);
            console.log(`   Nome: ${pessoa.name}`);
            console.log(`   Documento: ${pessoa.document}`);
            console.log(`   Tipo: ${pessoa.type === 'client' ? 'Cliente' : 'Fornecedor'}`);
            console.log(`   Email: ${pessoa.contacts.find(c => c.type === 'email')?.value}`);

            // Fazer a requisição para a API
            const resultado = await fazerRequisicao(`${API_BASE_URL}/persons`, pessoa);

            console.log(`   ✅ Criado com sucesso! ID: ${resultado.id || 'N/A'}\n`);
            sucessos++;

            // Pequena pausa para não sobrecarregar o servidor
            await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
            console.log(`   ❌ Erro ao criar registro: ${error.message}\n`);
            erros++;
        }
    }

    // Resumo final
    console.log('🎯 Resumo da População:');
    console.log('========================');
    console.log(`✅ Registros criados com sucesso: ${sucessos}`);
    console.log(`❌ Registros com erro: ${erros}`);
    console.log(`📊 Total processado: ${sucessos + erros}`);
    console.log(`📈 Taxa de sucesso: ${((sucessos / (sucessos + erros)) * 100).toFixed(1)}%`);

    if (sucessos > 0) {
        console.log('\n🌐 Acesse seu frontend para ver os dados:');
        console.log('   http://localhost:3001/persons');
    }
}

// Verificar se o módulo fetch está disponível (Node.js 18+)
if (typeof fetch === 'undefined') {
    console.error('❌ Este script requer Node.js 18+ ou instale o pacote node-fetch');
    console.log('   npm install node-fetch');
    process.exit(1);
}

// Executar o script
popularBanco().catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
});
