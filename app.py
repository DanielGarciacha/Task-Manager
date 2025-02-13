from flask import Flask, request, jsonify, render_template
from flask_mysqldb import MySQL
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)

# Configurar logging detallado
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Configuración MySQL - Asegúrate que estos datos son correctos
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'task_manager_db'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'  # Esto hará que los resultados vengan como diccionarios

mysql = MySQL(app)

# Ruta de prueba para verificar que la API funciona
@app.route('/api/test', methods=['GET'])
def test_api():
    return jsonify({'message': 'API is working!'})

# Ruta para verificar la conexión a la base de datos
@app.route('/api/test-db', methods=['GET'])
def test_db():
    try:
        cur = mysql.connection.cursor()
        cur.execute('SELECT 1')
        result = cur.fetchone()
        cur.close()
        return jsonify({'message': 'Database connection successful', 'result': result})
    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Ruta para obtener tareas con mejor manejo de errores
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    try:
        logger.debug("Recibida solicitud para /api/tasks")
        user_id = request.args.get('user_id')
        logger.debug(f"user_id recibido: {user_id}")

        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400

        cur = mysql.connection.cursor()
        
        # Primero verificamos si el usuario existe
        cur.execute('SELECT * FROM users WHERE id = %s', [user_id])
        user = cur.fetchone()
        
        if not user:
            cur.close()
            return jsonify({'error': 'User not found'}), 404

        # Obtenemos las tareas
        cur.execute('''
            SELECT 
                id,
                title,
                description,
                DATE_FORMAT(due_date, '%%Y-%%m-%%d') as due_date,
                status,
                assigned_to
            FROM tasks 
            WHERE assigned_to = %s
        ''', [user_id])
        
        tasks = cur.fetchall()
        cur.close()

        logger.debug(f"Tareas encontradas: {tasks}")
        
        return jsonify({
            'success': True,
            'tasks': tasks
        })

    except Exception as e:
        logger.error(f"Error in get_tasks: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
