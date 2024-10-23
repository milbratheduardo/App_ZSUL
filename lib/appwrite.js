import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';
import axios from 'axios';

export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.milbratheduardo.zsul',
    projectId: '66acd9e100124f502bd9',
    databaseId: '66acda31000cc877959d',
    userCollectionId: '66acda4a00054c720a90',
    users_v1CollectionId: '67186ff4003a0a84cded',
    professional_v1CollectionId:'67188aa5001275afc709',
    workdays_v1CollectionId: '67188b52000b7386731a',
    alunoCollectionId: '66acda860023ccfb7f13',
    turmaCollectionId: '66acdac50024492e0523',
    chamadaCollectionId: '66acdaee000fcb0006c2',
    eventoCollectionId: '66db57280002bca07979',
    galeriaCollectionId: '66faff5a003d06eaaa70',
    bucketID: '66e05918000a8ba9a1cc',
    bucketContratosID: '66fee5cf002a7360f3c4',
    contratosCollectionId: '67041c35001b7d8f6764'
}

const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId) 
    .setPlatform(appwriteConfig.platform) 

    const account = new Account(client);
    const avatars = new Avatars(client);
    const databases = new Databases(client);
    const storage = new Storage(client);
    
    

    export const createUserProfessor = async (email, password, username, cpf, whatsapp, profession, modalidades, faixa_etaria, workdays) => {
      try {
        // Criação da conta Appwrite
        const newAccount = await account.create(
          ID.unique(),
          email,
          password
        );
    
        if (!newAccount) throw new Error("Account creation failed");
    
        // Gerar avatar a partir das iniciais do nome do usuário
        const avatarUrl = avatars.getInitials(username);
    
        // Login automático após a criação
        await signIn(email, password);
    
        // Salvar na tabela users_v1
        const userDoc = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.users_v1CollectionId, // Coleção users_v1
          ID.unique(),
          {
            email,                   // Email do usuário
            userId: newAccount.$id,   // ID da conta do usuário
            role: 'profissional'         // Papel do usuário (professor)
          }
        );
    
        // Salvar na tabela profissionais_v1
        const professionalDoc = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.professional_v1CollectionId, // Coleção profissionais_v1
          ID.unique(),
          {
            nome: username,           // Nome completo
            cpf,                      // CPF do professor
            whats: whatsapp,                 // WhatsApp do professor
            avatar: avatarUrl,        // URL do avatar com iniciais
            profissao: profession,    // Profissão selecionada
            modalidade: modalidades,  // Modalidades de esporte
            userId: newAccount.$id,   // ID da conta do usuário (referência à tabela users_v1)
            faixa_etaria              // Faixa etária selecionada
          }
        );
    
        // Salvar workdays (tabela workdays_v1)
        for (const day of workdays) {
          await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.workdays_v1CollectionId, // Coleção workdays_v1
            ID.unique(),
            {
              userId: newAccount.$id,   // ID da conta do usuário (referência à tabela users_v1)
              dias: day.dia,     // Dia da semana
              horario_inicial: day.start,  // Horário inicial
              horario_final: day.end    // Horário final
            }
          );
        }
    
        return { userDoc, professionalDoc };  // Retornar os documentos salvos para possível uso
      } catch (error) {
        console.error("Error in createUserProfessor:", error);
        throw new Error(error.message);
      }
    };
    
  

    export async function uploadImage(file) {
        if (!file) return;
      
        const { mimeType, ...rest } = file; // Extrai mimeType
        const asset = { type: mimeType, ...rest }; // Adiciona type com mimeType
      
        try {
          const uploadedFile = await storage.createFile(
            appwriteConfig.bucketID, // ID do bucket no Appwrite
            ID.unique(),             // ID único para o arquivo
            asset                    // Arquivo com type e outras propriedades
          );
      
          console.log('Upload realizado com sucesso:', uploadedFile.$id);
          return uploadedFile.$id;
        } catch (error) {
          console.error('Erro ao fazer upload do arquivo:', error);
          throw new Error('Erro ao fazer upload do arquivo: ' + error.message);
        }
      }

export const salvarImagem = async (file, title, userId) => {
        if (!file || !title || !userId) {
          throw new Error("Dados insuficientes para salvar a imagem. Certifique-se de que o arquivo, título e userId estão fornecidos.");
        }

        const { mimeType, ...rest } = file; // Extrai mimeType
        const asset = { type: mimeType, ...rest }; // Adiciona type com mimeType
      
        try {
          // Upload da imagem para o Appwrite Storage
          const fileUploaded = await storage.createFile(
            appwriteConfig.bucketID, // ID do bucket no Appwrite
            ID.unique(),             // ID único para o arquivo
            asset                     // Objeto do arquivo, que inclui uri, name e type
          );
      
          console.log('Upload realizado com sucesso:', fileUploaded.$id);
      
          // Salvar os dados no banco de dados 'Galeria'
          const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.galeriaCollectionId,
            ID.unique(),
            {
              ImageId: fileUploaded.$id,  // ID da imagem no storage
              title: title,
              userId: userId,  // ID do usuário que enviou
            }
          );
      
          console.log('Imagem salva na galeria:', response);
          return response; // Retorna o documento salvo
        } catch (error) {
          console.error('Erro ao salvar imagem na galeria:', error);
          throw new Error('Erro ao salvar imagem na galeria: ' + error.message);
        }
};

export const deleteImageByImageId = async (imageId) => {
  if (!imageId) {
    throw new Error("ID da imagem não fornecido.");
  }

  try {
    // Buscar o documento no banco de dados onde ImageId == imageId
    const query = [
      Query.equal('ImageId', imageId) // Busca por documentos onde o campo 'ImageId' corresponde ao imageId do Storage
    ];
    
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.galeriaCollectionId,
      query
    );

    if (response.documents.length === 0) {
      throw new Error('Documento correspondente ao ImageId não encontrado.');
    }

    const documentId = response.documents[0].$id; // Pega o ID do documento encontrado

    // Deletar o documento da galeria correspondente no banco de dados
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.galeriaCollectionId,
      documentId // ID do documento a ser deletado
    );

    console.log('Documento da galeria deletado com sucesso:', documentId);
    return documentId; // Retorna o documento deletado
  } catch (error) {
    console.error('Erro ao deletar a imagem:', error);
    throw new Error('Erro ao deletar a imagem: ' + error.message);
  }
};


      
      
    

export const createUserResponsavel = async (email,password,username,
    cpf,endereco, bairro, rg, whatsapp, role) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password
        )

        if(!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username)

        await signIn(email, password)

        const newUserResponsavel = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                userId: newAccount.$id,
                email,
                username,
                avatar: avatarUrl,
                whatsapp,
                cpf,
                endereco,
                bairro,
                rg,
                role: 'responsavel'
            }
        )

        return newUserResponsavel;
    } catch (error) {
        console.log(Error);
        throw new Error(error);
    }
}

export const createAluno = async (email, password, username, nascimento, rg, escola, ano, whatsapp, createdByUsername, createdByUserId) => {
    try {
        let newAccount = null;
        let avatarUrl = '';

        if (email && password) {
            newAccount = await account.create(
                ID.unique(),
                email,
                password
            );

            if (!newAccount) throw new Error('Falha ao criar conta');

            avatarUrl = avatars.getInitials(username);

        }

        const documentData = {
            email: email || null,
            username,
            avatar: avatarUrl || null,
            nascimento,
            rg,
            escola,
            ano,
            whatsapp,
            createdByUsername,
            createdByUserId,    
            role: 'aluno'
        };

        
        if (newAccount) {
            documentData.userId = newAccount.$id;
        }

        const newUserAluno = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.alunoCollectionId,
            ID.unique(),
            documentData
        );

        return newUserAluno;
    } catch (error) {
        console.error('Erro ao criar aluno:', error);
        throw new Error(error);
    }
}





export const signIn = async (email, password) => {
    try {
        const session = await account.createEmailPasswordSession(email, password)

        return session;
    } catch (error) {
        throw new Error(error);
    }
}


export const getCurrentUser = async () => {
  try {
    // Pega a conta atual logada no Appwrite
    const currentAccount = await account.get();
    if (!currentAccount) throw new Error('Usuário não encontrado');

    // Primeiro, tenta buscar o usuário na tabela de "users"
    let currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('userId', currentAccount.$id)]
    );

    // Se não encontrou na tabela de usuários, tenta buscar na tabela de "alunos"
    if (!currentUser || currentUser.total === 0) {
      currentUser = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.alunoCollectionId,
        [Query.equal('userId', currentAccount.$id)]
      );

      if (!currentUser || currentUser.total === 0) {
        throw new Error('Usuário não encontrado em nenhuma coleção');
      }

      // Adiciona a role de "aluno" ao objeto retornado
      return {
        ...currentUser.documents[0],
        role: 'aluno',
      };
    }

    // Se encontrou na tabela de usuários, retorna o usuário normalmente
    return {
      ...currentUser.documents[0],
      role: currentUser.documents[0].role || 'user', // Assume que role será "user" se não estiver definida
    };
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error);
    throw new Error(error);
  }
};


export const getAllTurmas = async () => {
    try {
        const turmas = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.turmaCollectionId
        )

        return turmas.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const getAlunosByUserId = async (userId) => {
    try {
        const alunos = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.alunoCollectionId,
            [
                Query.equal('createdByUserId', userId) 
            ]
        );

        return alunos.documents;
    } catch (error) {
        throw new Error(error.message || 'Erro ao buscar alunos.');
    }
};


export const signOut = async () => {
    try {
        const session = await account.deleteSession('current');
        console.log("Sessão encerrada com sucesso:", session);
        return session;
    } catch (error) {
        console.error("Erro ao realizar logout:", error.message || error);
        throw new Error("Não foi possível realizar o logout. Tente novamente.");
    }
};



export const createTurma = async (title, Qtd_Semana, Dia1, Dia2, Dia3, Local, MaxAlunos, Horario_de_inicio, Horario_de_termino) => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId, 
        appwriteConfig.turmaCollectionId, 
        ID.unique(), 
        {
          title,
          Qtd_Semana,
          Dia1,
          Dia2,
          Dia3,
          Local,
          MaxAlunos,
          Horario_de_inicio,
          Horario_de_termino
        }
      );
      return response;
    } catch (error) {
      throw new Error("Erro ao criar turma: " + error.message);
    }
  };

  export const createEvent = async (Title, Date_event, Description, Hora_event, ImageID, Type) => {
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.eventoCollectionId,
            ID.unique(),
            {
                Title,
                Date_event,
                Description,
                Hora_event,
                ImageID,  // Armazena o ID da imagem
                Type      // Armazena o tipo de evento (evento ou partida)
            }
        );
        return response;
    } catch (error) {
        throw new Error("Erro ao criar evento: " + error.message);
    }
};

export const createMatch = async (Title, Date_event, Description, Hora_event, ImageID, Confirmados, Type) => {
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.eventoCollectionId,
            ID.unique(),
            {
                Title,
                Date_event,
                Description,
                Hora_event,
                ImageID,  // Armazena o ID da imagem
                Confirmados,
                Type      // Armazena o tipo de evento (evento ou partida)
            }
        );
        return response;
    } catch (error) {
        throw new Error("Erro ao criar evento: " + error.message);
    }
};


  export const getAllEvents = async () => {
    try {
        const events = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.eventoCollectionId
        )

        return events.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const getEventsByDate = async (date) => {
    try {
        const events = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.eventoCollectionId,
            [
                Query.equal('Date_event', date) 
            ]
        );

        return events.documents;
    } catch (error) {
        throw new Error(error);
    }
};

export const getImageUrl = async (imageId) => {
    try {
      const imageUrl = await storage.getFileView(appwriteConfig.bucketID, imageId);
      return imageUrl.href;  // Retorna a URL da imagem
    } catch (error) {
      console.error("Erro ao obter a URL da imagem:", error);
      throw new Error("Não foi possível obter a URL da imagem.");
    }
  };


export const getPdfUrl = async (fileId) => {
    try {
      const pdfUrl = await storage.getFileView(appwriteConfig.bucketContratosID, fileId);
      return pdfUrl.href;  // Retorna a URL do PDF
    } catch (error) {
      console.error("Erro ao obter a URL do PDF:", error);
      throw new Error("Não foi possível obter a URL do PDF.");
    }
  };
  
  

export const getAllAlunos = async () => {
    try {
        const alunos = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.alunoCollectionId
        )

        return alunos.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const getAllUsers = async () => {
  try {
      const users = await databases.listDocuments(
          appwriteConfig.databaseId,    // ID do banco de dados
          appwriteConfig.userCollectionId // ID da coleção de usuários
      );

      return users.documents; // Retorna os documentos de usuários
  } catch (error) {
      throw new Error(error);
  }
};

export const getAlunosById = async (alunoId) => {
    try {
      const aluno = await databases.getDocument(
        appwriteConfig.databaseId,  // ID do banco de dados
        appwriteConfig.alunoCollectionId,  // ID da coleção de alunos
        alunoId  // ID do documento do aluno
      );
  
      return aluno; // Retorna o documento do aluno
    } catch (error) {
      throw new Error('Erro ao buscar aluno pelo ID: ' + error.message);
    }
  };


  export const getUsersById = async (userId) => {
    try {
      const user = await databases.getDocument(
        appwriteConfig.databaseId,  // ID do banco de dados
        appwriteConfig.userCollectionId,  // ID da coleção de alunos
        userId  // ID do documento do aluno
      );
  
      return user; // Retorna o documento do aluno
    } catch (error) {
      throw new Error('Erro ao buscar aluno pelo ID: ' + error.message);
    }
  };
  
  export const getUsersByUserId = async (userId) => {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [
          Query.equal('userId', userId)
        ]
      );
  
      if (response.documents.length > 0) {
        return response.documents[0]; // Retorna o primeiro documento encontrado
      } else {
        throw new Error('Nenhum usuário encontrado com esse userId.');
      }
    } catch (error) {
      console.error('Erro ao buscar usuário pelo userId:', error.message);
      throw new Error('Erro ao buscar usuário pelo userId: ' + error.message);
    }
  };

  export const addAlunoToTurma = async (alunoId, turmaId) => {
    try {
      const updatedAluno = await databases.updateDocument(
        appwriteConfig.databaseId, 
        appwriteConfig.alunoCollectionId, 
        alunoId, 
        { turma_id: turmaId } 
      );
  
      return updatedAluno;
    } catch (error) {
      throw new Error(`Erro ao adicionar o aluno à turma: ${error.message}`);
    }
  };

  export const salvarChamada = async (chamadaData) => {
    try {
      const response = await databases.createDocument(
        appwriteConfig.databaseId, // ID do banco de dados
        appwriteConfig.chamadaCollectionId, // ID da coleção de chamadas
        ID.unique(), // ID único para o documento
        chamadaData // Dados da chamada: data, turma_id, presentes e ausentes
      );
      return response;
    } catch (error) {
      throw new Error(`Erro ao salvar a chamada: ${error.message}`);
    }
  };

  export const getChamadasByTurmaId = async (turmaId) => {
    try {
      const chamadas = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.chamadaCollectionId,
        [Query.equal('turma_id', turmaId)]
      );
      return chamadas.documents;
    } catch (error) {
      throw new Error(`Erro ao buscar chamadas: ${error.message}`);
    }
  };

  export const getAlunosByTurmaId = async (turmaId) => {
    try {
        const alunos = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.alunoCollectionId,
            [
                Query.equal('turma_id', turmaId) 
            ]
        );

        return alunos.documents;
    } catch (error) {
        throw new Error(error.message || 'Erro ao buscar alunos.');
    }
};

  export const updateEventConfirmados = async (eventId, confirmados) => {
    try {
      // Primeiro, obtenha o documento original do evento
      const event = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.eventoCollectionId,
        eventId
      );
  
      // Crie um novo objeto contendo apenas os campos que precisam ser atualizados
      const updatedEvent = {
        Title: event.Title,
        Date_event: event.Date_event,
        Description: event.Description,
        Hora_event: event.Hora_event,
        Type: event.Type,
        Confirmados: confirmados, // Atualiza o campo Confirmados
        // Adicione aqui outros campos que o documento do evento possui
      };
  
      // Atualize o evento com os campos filtrados
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.eventoCollectionId,
        eventId,
        updatedEvent
      );
    } catch (error) {
      throw new Error('Erro ao atualizar o evento: ' + error.message);
    }
  };


  export const getTurmaById = async (turmaId) => {
    try {
      const turma = await databases.getDocument(
        appwriteConfig.databaseId,  // ID do banco de dados
        appwriteConfig.turmaCollectionId,  // ID da coleção de turmas
        turmaId  // ID do documento da turma
      );
      return turma;
    } catch (error) {
      throw new Error('Erro ao buscar turma pelo ID: ' + error.message);
    }
  };

  
export const updateChamada = async (chamadaId, { presentes, ausentes }) => {
    try {
      // Implemente a lógica para atualizar a chamada no banco de dados usando Appwrite
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.chamadaCollectionId,
        chamadaId,
        { presentes, ausentes }
      );
    } catch (error) {
      throw new Error('Erro ao atualizar chamada: ' + error.message);
    }
  };

  export const deleteChamadaById = async (chamadaId) => {
    try {
      // Lógica para deletar a chamada no banco de dados usando Appwrite
      await databases.deleteDocument(
        appwriteConfig.databaseId,          // ID do banco de dados
        appwriteConfig.chamadaCollectionId,  // ID da coleção de chamadas
        chamadaId                            // ID do documento (chamada) a ser deletado
      );
    } catch (error) {
      throw new Error('Erro ao deletar chamada: ' + error.message);
    }
  };

  // Função para deletar uma turma
export const deletarTurma = async (turmaId) => {
  try {
    // Lógica para deletar a turma no banco de dados usando Appwrite
    await databases.deleteDocument(
      appwriteConfig.databaseId,          // ID do banco de dados
      appwriteConfig.turmaCollectionId,   // ID da coleção de turmas
      turmaId                              // ID do documento (turma) a ser deletado
    );
  } catch (error) {
    throw new Error('Erro ao deletar turma: ' + error.message);
  }
};



  export const getAllImages = async () => {
    try {
      // Busca todos os documentos da coleção 'Galeria'
      const images = await databases.listDocuments(
        appwriteConfig.databaseId,       // ID do banco de dados
        appwriteConfig.galeriaCollectionId // ID da coleção 'Galeria'
      );
  
      // Mapeia para extrair apenas os campos necessários (neste caso, imageId, title, userId)
      const imageDetails = images.documents.map((doc) => ({
        imageId: doc.ImageId,
        title: doc.title,
        userId: doc.userId,
      }));
  
      return imageDetails; // Retorna apenas os detalhes selecionados
    } catch (error) {
      console.error('Erro ao buscar imagens da galeria:', error);
      throw new Error('Erro ao buscar imagens da galeria: ' + error.message);
    }
  };


 export const atualizarDiaCobranca = async (alunoId, diaCobranca) => {
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.alunoCollectionId,
        alunoId,
        {
          dia_cobranca: diaCobranca
        }
      );
    } catch (error) {
      console.error('Erro ao atualizar o dia da cobrança:', error);
      throw new Error('Erro ao salvar o dia da cobrança');
    }
  };

  export const updateAlunoContrato = async (alunoId, { tipo_contrato, indice_fluxo }) => {
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.alunoCollectionId,
        alunoId,
        {
          tipo_contrato: tipo_contrato,
          indice_fluxo: indice_fluxo
        }
      );
    } catch (error) {
      console.error('Erro ao atualizar o contrato do aluno:', error);
      throw new Error('Erro ao salvar as informações do contrato');
    }
  };

  export const updateAlunoFatura = async (alunoId, { pagamento }) => {
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,       // O ID do banco de dados do Appwrite
        appwriteConfig.alunoCollectionId, // O ID da coleção de alunos no Appwrite
        alunoId,                          // O ID do aluno a ser atualizado
        {
          pagamento: pagamento            // Atualizando a coluna 'pagamento' com o valor recebido
        }
      );
    } catch (error) {
      console.error('Erro ao atualizar a fatura do aluno:', error);
      throw new Error('Erro ao salvar as informações de pagamento');
    }
  };
  
  export const resetPagamento = async () => {
    try {
      const today = new Date();
      if (today.getDate() === 28) {
        // Supondo que você possa buscar todos os alunos com um filtro ou buscar todos de uma vez
        const alunosCollectionId = appwriteConfig.alunoCollectionId;
        const databaseId = appwriteConfig.databaseId;
  
        // Busca todos os alunos
        const alunos = await databases.listDocuments(databaseId, alunosCollectionId);
  
        // Atualiza o campo pagamento para null em todos os alunos
        const updatePromises = alunos.documents.map(async (aluno) => {
          await databases.updateDocument(
            databaseId,
            alunosCollectionId,
            aluno.$id,
            { pagamento: null } // Atualizando o campo pagamento para null
          );
        });
  
        await Promise.all(updatePromises);
        console.log('Coluna pagamento atualizada para null em todos os alunos.');
      }
    } catch (error) {
      console.error('Erro ao resetar a coluna pagamento:', error);
      throw new Error('Erro ao resetar o campo pagamento.');
    }
  };
  

  export const updateAlunoFluxo = async (alunoId, { indice_fluxo, token_contrato }) => {
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.alunoCollectionId,
        alunoId,
        {
          token_contrato: token_contrato,
          indice_fluxo: indice_fluxo
        }
      );
    } catch (error) {
      console.error('Erro ao atualizar o contrato do aluno:', error);
      throw new Error('Erro ao salvar as informações do contrato');
    }
  };







  
  

  
  
  
  
  

