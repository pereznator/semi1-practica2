import boto3
from botocore.exceptions import NoCredentialsError
from flask import Flask, request, session, jsonify
from flask_cors import CORS
import base_de_datos as bd
from dotenv import load_dotenv
import os
import json
import hashlib

load_dotenv()

app = Flask(__name__)
CORS(app)
app.secret_key = os.urandom(24)

rek_access_key_id = os.getenv("REK_ACCESS_KEY_ID") 
rek_secret_access_key = os.getenv("REK_SECRET_ACCESS_KEY") 

translate_access_key_id = os.getenv("TRANSLATE_ACCESS_KEY_ID") 
translate_secret_access_key = os.getenv("TRANSLATE_SECRET_ACCESS_KEY") 

s3_access_key_id = os.getenv("S3_ACCESS_KEY_ID") 
s3_secret_access_key = os.getenv("S3_SECRET_ACCESS_KEY") 

lex_access_key_id = os.getenv("LEX_ACCESS_KEY_ID")
lex_secret_access_key = os.getenv("LEX_SECRET_ACCESS_KEY")

Cliente_Rek = boto3.client('rekognition', region_name='us-east-1', aws_access_key_id=rek_access_key_id, aws_secret_access_key=rek_secret_access_key)

Cliente_Translate = boto3.client('translate', region_name='us-east-1', aws_access_key_id=translate_access_key_id, aws_secret_access_key=translate_secret_access_key)

Cliente_Lex = boto3.client("lexv2-runtime", region_name='us-east-1', aws_access_key_id=lex_access_key_id, aws_secret_access_key=lex_secret_access_key)

@app.route('/registrar',methods=["POST"])
def registrar_usuario():
    Parametros_Texto = request.form.get('datos')
    Parametros = json.loads(Parametros_Texto)
    Nombre_Usuario_Recibido = Parametros['nombre_usuario']
    Nombre_Completo_Recibido = Parametros['nombre_completo']
    Password_Recibido = Parametros['password']
    Foto = request.files.get('foto')
    Password_MD5 = hashlib.md5(Password_Recibido.encode()).hexdigest()
    Usuario = bd.Agregar_Usuario(Nombre_Usuario_Recibido, Nombre_Completo_Recibido, Password_MD5)
    if Foto:
        s3 = boto3.client('s3', aws_access_key_id=s3_access_key_id, aws_secret_access_key=s3_secret_access_key)
        carpeta_y_foto = "Fotos_Perfil/"+Foto.filename
        s3.upload_fileobj(Foto, "practica1-g11-imagenes", carpeta_y_foto)
        Enlace_S3 = f"https:practica1-g11-imagenes.s3.amazonaws.com/{carpeta_y_foto}"
        Nombre_Foto_Sin_Extencion = Foto.filename.split('.')[0]
        Usuario_Con_URL = bd.Guardar_Enlace_S3(Usuario[0], Enlace_S3, Nombre_Foto_Sin_Extencion)
        Foto_Actual = bd.Obtener_Foto_Actual(Usuario_Con_URL[4])
        Usuario_Dic = {'usuario_id': Usuario_Con_URL[0], 'nombre_usuario': Usuario_Con_URL[1], 'nombre_completo': Usuario_Con_URL[2], 'password':Usuario_Con_URL[3], 'foto_url': Foto_Actual}
        return jsonify(Usuario_Dic), 200
    else:
        Usuario_Dic = {'usuario_id': Usuario[0], 'nombre_usuario': Usuario[1],
                       'nombre_completo': Usuario[2], 'password': Usuario[3], 'foto_url': ''}

        return jsonify(Usuario_Dic), 200

@app.route('/iniciar',methods=["POST"])
def iniciar_sesion():
    Parametros_Texto = request.form.get('datos')
    Parametros = json.loads(Parametros_Texto)

    # Declarar posibles variables que pueden venir en el body.
    Nombre_Usuario_Recibido = None
    Password_Recibido = None
    es_por_foto = False
    foto_recibida = None

    # Si las varialbes vienen en el body, almacenarlas
    if 'nombre_usuario' in Parametros:
      Nombre_Usuario_Recibido = Parametros['nombre_usuario']

    if 'password' in Parametros:
      Password_Recibido = Parametros['password']

    # Almacenar bandera para saber si el login es por foto
    if 'es_por_foto' in Parametros:
      es_por_foto = Parametros['es_por_foto']
    
    if 'foto' in request.files:
      foto_recibida = request.files.get('foto')

    # Validar que se hayan ingresado las credenciales si el inicio de sesion no es por foto.
    if not es_por_foto and (Nombre_Usuario_Recibido == None or Password_Recibido == None):
      res = "Si el inicio de sesión no es por foto, se deben de ingresar las credenciales."
      return res, 400
    
      
    if es_por_foto:
      if foto_recibida == None:
        res = "Si el inicio de sesión es por foto, se debe ingresar la foto."
        return res, 400

      if Nombre_Usuario_Recibido == None:
        res = "Si el inicio de sesión es por foto, se debe ingresar el nombre de usuario."
        return res, 400
        
      usuario = bd.obtener_usuario_por_nombre(Nombre_Usuario_Recibido)
      if usuario == None:
        res = "No se encontró el usuario."
        return res, 404

      id_foto_perfil = usuario[4]

      foto_perfil = bd.obtener_foto_por_id(id_foto_perfil)
      if foto_perfil == None:
        res = "No se encontró foto de perfil."
        return res, 404

      nombre_foto_perfil = foto_perfil[1]
      carpeta_y_foto = "Fotos_Perfil/" + nombre_foto_perfil + ".jpg"

      try:
        # Utilizar AWS Rekognition para comparar las imágenes
        response = Cliente_Rek.compare_faces(
            SourceImage={ 'Bytes': foto_recibida.read() },
            TargetImage={ 'S3Object': { 'Bucket': 'practica1-g11-imagenes', 'Name': carpeta_y_foto }}
        )
        # Verificar si se encontraron caras coincidentes
        if len(response['FaceMatches']) > 0:
          usuario_diccionario = { 'usuario_id': usuario[0], 'nombre_usuario': usuario[1], 'nombre_completo': usuario[2], 'password': usuario[3], 'foto_url': foto_perfil[4] }
          return jsonify(usuario_diccionario), 200
        else:
          return jsonify("No hay coincidencia en el reconocimiento facial."), 404
      except Exception as e:
        return jsonify({'error': str(e)}), 500

      return jsonify({'message': "Es por foto!!", 'foto': nombre_foto_perfil}), 200
    
    Password_MD5 = hashlib.md5(Password_Recibido.encode()).hexdigest()
    Usuario_Con_URL = bd.Verificar_Credenciales(Nombre_Usuario_Recibido,Password_MD5)
    if Usuario_Con_URL != -1:
      session['usuario_id'] = Usuario_Con_URL[0]
      Foto_Actual = bd.Obtener_Foto_Actual(Usuario_Con_URL[4])
      Usuario_Dic = {'usuario_id': Usuario_Con_URL[0], 'nombre_usuario': Usuario_Con_URL[1],
                    'nombre_completo': Usuario_Con_URL[2], 'password': Usuario_Con_URL[3], 'foto_url': Foto_Actual}
      return jsonify(Usuario_Dic),200
    else:
      res = "Credenciales no coinciden."
      return res, 404

@app.route('/usuario/<int:idUsuario>',methods=["GET"])
def datos_personales(idUsuario):
    id = session.get('usuario_id')
    if id:
        tupla_datos = bd.Obtener_Datos_Personales(id)
        Foto_Actual = bd.Obtener_Foto_Actual(tupla_datos[4])
        res = {
        'usuario_id':tupla_datos[0],
        'nombre_usuario': tupla_datos[1],
        'nombre_completo': tupla_datos[2],
        'password': tupla_datos[3],
        'foto_url': Foto_Actual
        }
        return jsonify(res), 200
    else:
        res = "No se pudo iniciar sesion"
        return res, 404

@app.route('/cerrar',methods=["GET"])
def cerrar_sesion():
    session.clear()
    res = "Sesion cerrada correctamente"
    return res, 200

@app.route('/actualizar-usuario/<int:idUsuario>',methods=["PUT"])
def actualizar_usuario_registrado(idUsuario):
    Parametros_Texto = request.form.get('datos')
    Parametros = json.loads(Parametros_Texto)
    Nombre_Usuario_Recibido = Parametros['nombre_usuario']
    Nombre_Completo_Recibido = Parametros['nombre_completo']
    Password_Recibido = Parametros['password']
    Foto = request.files['foto']
    id = session.get('usuario_id')
    Password_MD5 = hashlib.md5(Password_Recibido.encode()).hexdigest()
    Usuario = bd.Editar_Usuario(id,Nombre_Usuario_Recibido,Nombre_Completo_Recibido,Password_MD5)
    if Foto:
        s3 = boto3.client('s3', aws_access_key_id=s3_access_key_id, aws_secret_access_key=s3_secret_access_key)
        carpeta_y_foto = "Fotos_Perfil/" + Foto.filename
        s3.upload_fileobj(Foto, "practica1-g11-imagenes", carpeta_y_foto)
        Enlace_S3 = f"https:practica1-g11-imagenes.s3.amazonaws.com/{carpeta_y_foto}"
        Nombre_Foto_Sin_Extencion = Foto.filename.split('.')[0]
        Usuario_Con_URL = bd.Actualizar_Enlace_S3(id, Enlace_S3, Nombre_Foto_Sin_Extencion)
        Foto_Actual = bd.Obtener_Foto_Actual(Usuario_Con_URL[4])
        Usuario_Dic = {'usuario_id': Usuario_Con_URL[0], 'nombre_usuario': Usuario_Con_URL[1],
                   'nombre_completo': Usuario_Con_URL[2], 'password': Usuario_Con_URL[3], 'foto_url': Foto_Actual}
        return jsonify(Usuario_Dic)
    else:
        Usuario_Dic = {'usuario_id': Usuario[0], 'nombre_usuario': Usuario[1],
                       'nombre_completo': Usuario[2], 'password': Usuario[3], 'foto_url': ''}

        return jsonify(Usuario_Dic),200

@app.route('/crear-album/<int:idUsuario>',methods=["POST"])
def crear_album_nuevo(idUsuario):
    id = session.get('usuario_id')
    Parametros = request.get_json(force=True)
    Nombre_Album_Recibido = Parametros['nombre_album']

    bd.Agregar_Album(Nombre_Album_Recibido, id)

    res = "Se agrego album"
    return res, 200

@app.route('/albumes/<int:idUsuario>',methods=["GET"])#regresar toda la tabla
def obtener_albumes(idUsuario):
    id = session.get('usuario_id')
    if id:
        lista_tuplas_albumes = bd.Obtener_Los_Albumes(id)
        return jsonify(lista_tuplas_albumes), 200
    else:
        res = "No has iniciado sesion"
        return res, 404

@app.route('/actualizar-album/<int:idAlbum>',methods=["PUT"])
def actualizar_album(idAlbum):
    id = session.get('usuario_id')
    Parametros = request.get_json(force=True)
    Nombre_Album_Nuevo_Recivido = Parametros['nombre_album']

    bd.Editar_Album(idAlbum,Nombre_Album_Nuevo_Recivido)

    res = "Se actualizo album"
    return res, 200

@app.route('/eliminar-album/<int:idAlbum>',methods=["DELETE"])
def eliminar_album(idAlbum):

    bd.Borrar_Album(idAlbum)

    res = "Se borro el album"
    return res, 200


@app.route('/cargarfoto',methods=["POST"])
def Almacenar_Foto():
    id = session.get('usuario_id')
    P_Nombre = request.form.get('nombre')
    P_Descripcion = request.form.get('descripcion')
    Foto = request.files.get('foto')
    Foto_Bytes = Foto.read()
    s3 = boto3.client('s3', aws_access_key_id=s3_access_key_id, aws_secret_access_key=s3_secret_access_key)
    carpeta_y_foto = "Fotos_Publicadas/"+Foto.filename
    s3.upload_fileobj(Foto, "practica1-g11-imagenes", carpeta_y_foto)
    Enlace_S3 = f"https:practica1-g11-imagenes.s3.amazonaws.com/{carpeta_y_foto}"


    res_rek = Cliente_Rek.detect_labels(
        Image={'Bytes': Foto_Bytes}
    )
    Lista_etiquetas = res_rek['Labels']
    Etiquetas_principales = []
    c = 0
    while c != 5:
        Informacion = Lista_etiquetas[c]
        Etiquetas_principales.append(Informacion['Name'])
        c += 1

    Lista_Id_Album = bd.Crear_Nuevos_Albumes(Etiquetas_principales,id)
    c = 0
    while c != len(Lista_Id_Album):
        bd.Guardar_Foto(Lista_Id_Album[c], Enlace_S3, P_Nombre, P_Descripcion)
        c += 1
    return "Se guardo la foto",200

@app.route('/extraer-texto',methods=["POST"])
def Extraer_Texto_Imagen():
    Foto = request.files.get('foto')
    Foto_Bytes = Foto.read()
    try:
        res_rek = Cliente_Rek.detect_text(Image={'Bytes': Foto_Bytes})
        texto_rek = ""
        c = 0
        while c < len(res_rek['TextDetections']):
            texto_rek += res_rek['TextDetections'][c]['DetectedText']
            c += 1
        return jsonify({'texto': texto_rek}), 200
    except:
        res = "Error al extraer texto"
        return res, 404

@app.route('/traducirtexto', methods=['POST'])
def traducir():
    Texto_Original = request.json['texto']
    Idioma_Nuevo = request.json['idioma']
    if Idioma_Nuevo == "1":
        try:
            res_tra = Cliente_Translate.translate_text(Text=Texto_Original, SourceLanguageCode='auto',
                                                TargetLanguageCode='es')
            Texto_Nuevo = res_tra['TranslatedText']
            return jsonify({'traduccion': Texto_Nuevo}), 200

        except:
            res = "Error al extraer texto"
            return res, 404
    if Idioma_Nuevo == "2":
        try:
            res_tra = Cliente_Translate.translate_text(Text=Texto_Original, SourceLanguageCode='auto',
                                                TargetLanguageCode='en')
            Texto_Nuevo = res_tra['TranslatedText']
            return jsonify({'traduccion': Texto_Nuevo}), 200

        except:
            res = "Error al extraer texto"
            return res, 404
    if Idioma_Nuevo == "3":
        try:
            res_tra = Cliente_Translate.translate_text(Text=Texto_Original, SourceLanguageCode='auto',
                                                TargetLanguageCode='de')
            Texto_Nuevo = res_tra['TranslatedText']
            return jsonify({'traduccion': Texto_Nuevo}), 200

        except:
            res = "Error al extraer texto"
            return res, 404
    if Idioma_Nuevo == "4":
        try:
            res_tra = Cliente_Translate.translate_text(Text=Texto_Original, SourceLanguageCode='auto',
                                                TargetLanguageCode='fr')
            Texto_Nuevo = res_tra['TranslatedText']
            return jsonify({'traduccion': Texto_Nuevo}), 200

        except:
            res = "Error al extraer texto"
            return res, 404
    if Idioma_Nuevo == "5":
        try:
            res_tra = Cliente_Translate.translate_text(Text=Texto_Original, SourceLanguageCode='auto',
                                                TargetLanguageCode='it')
            Texto_Nuevo = res_tra['TranslatedText']
            return jsonify({'traduccion': Texto_Nuevo}), 200

        except:
            res = "Error al extraer texto"
            return res, 404

@app.route("/chatbot", methods=["POST"])
def chatbot_escribir():
  try:

    sessionId = session.get('usuario_id')
    if sessionId == None:
      sessionId = 0
      # return jsonify({'error': 'id del usuario no encontrado'}), 400

    idStr = str(sessionId)

    if sessionId < 10:
      idStr = '0' + idStr

    parametros = request.get_json(force=True)
    if not 'mensaje' in parametros:
      return jsonify({'error': 'no se encontro el mensaje'}), 400
    
    mensaje = parametros['mensaje']

    if len(mensaje) == 0:
      return jsonify({'error': 'El mensaje debe tener por lo menos un caracter.'}), 400

    respuesta = Cliente_Lex.recognize_text(
        botId='YUOI7YAC3Z',
        botAliasId='Y5Q2CUJM1Q',
        localeId='es_ES',
        sessionId=idStr,
        text=mensaje
    )

    print("[[RESPUESTA]]", respuesta)
    if not 'messages' in respuesta:
      return jsonify({'error': 'el chatbot no funciono'}), 500

    return jsonify(respuesta['messages']), 200
  except Exception as error:
    return jsonify({'error': str(error)}), 500 


@app.route('/check')
def chequeo():
    res = ""
    return res, 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)