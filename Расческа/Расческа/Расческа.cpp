#include "CombSort.h"
#include "UnoTest.h"
#include <iostream>
#include <fstream>
#include <vector>
#include <random>
#include <string>

using namespace std;

// Ввод с клавиатуры
vector<int> inputFromKeyboard() {
    vector<int> arr;
    int n, val;
    cout << "Введите количество элементов: ";
    cin >> n;

    if (n <= 0) {
        throw invalid_argument("Количество элементов должно быть положительным");
    }

    cout << "Введите элементы (через пробел): ";
    for (int i = 0; i < n; ++i) {
        cin >> val;
        arr.push_back(val);
    }
    return arr;
}

// Генерация случайных чисел
vector<int> generateRandom(int n, int minVal = -100, int maxVal = 100) {
    if (n <= 0) {
        throw invalid_argument("Количество элементов должно быть положительным");
    }

    vector<int> arr(n);
    random_device rd;
    mt19937 gen(rd());
    uniform_int_distribution<> dis(minVal, maxVal);

    for (int& x : arr) {
        x = dis(gen);
    }
    return arr;
}

// Загрузка из файла
vector<int> loadFromFile() {
    string filename;

    // Запрос имени файла у пользователя
    cout << "Введите имя файла: ";
    cin >> filename;
    vector<int> result;
    ifstream file(filename);

    // Проверка успешности открытия файла
    if (!file.is_open()) {
        throw runtime_error("Не удалось открыть файл: " + filename);
    }

    int value;
    // Чтение чисел из файла до конца
    while (file >> value) {
        result.push_back(value);
    }

    file.close();
    return result;
}

// Вывод массива на экран
void printArray(const vector<int>& arr, const string& label) {
    cout << label << ":\n";
    for (size_t i = 0; i < arr.size(); ++i) {
        cout << arr[i];
        if (i < arr.size() - 1) {
            cout << " ";
        }
    }
    cout << "\n\n";
}

// Сохранение массива в файл
void saveToFile(const vector<int>& arr, const string& filename) {
    ofstream file(filename);

    if (!file.is_open()) {
        throw runtime_error("Не удалось создать файл: " + filename);
    }

    for (size_t i = 0; i < arr.size(); ++i) {
        file << arr[i];
        if (i < arr.size() - 1) {
            file << " ";
        }
    }

    file.close();
    cout << "Массив сохранён в файл: " << filename << "\n\n";
}

int main() {
    setlocale(LC_ALL, "Russian");
    try {
        vector<int> arr;
        int choice = 0;

        // Меню выбора способа ввода
        cout << "=== Сортировка расчёской ===\n";

        while (choice != 4) {
            cout << "Выберите способ ввода массива:\n";
            cout << "1. Ввод с клавиатуры\n";
            cout << "2. Генерация случайных чисел\n";
            cout << "3. Загрузка из файла\n";
            cout << "4. Запустить тесты\n";
            cout << "5. Завершить программу\n";
            cout << "Ваш выбор: ";
            cin >> choice;

            switch (choice) {
            case 1:
                arr = inputFromKeyboard();
                break;
            case 2: {
                int n;
                cout << "Количество элементов: ";
                cin >> n;
                arr = generateRandom(n);
                break;
            }
            case 3: {
                
                arr = loadFromFile();
                break;
            }
            case 4: {

                Test();
                return 0;
                break;
            }
            case 5: {
                cout << "До скорых встреч! ";
                return 0;
                break;
            }
            default:
                cerr << "Неверный выбор!\n";
                return 1;
            }

            // Вывод исходного массива
            printArray(arr, "Исходный массив");

            // Сортировка
            combSort(arr);

            // Вывод отсортированного массива
            printArray(arr, "Отсортированный массив");

            // Предложение сохранить результаты
            char saveChoice;
            cout << "Сохранить массив в файл? (y/n): ";
            cin >> saveChoice;

            if (saveChoice == 'y' || saveChoice == 'Y') {
                string outFile;
                
                cout << "Имя файла для отсортированного массива: ";
                cin >> outFile;

                saveToFile(arr, outFile);
            }
        }

        }
        catch (const exception& e) {
            cerr << "Ошибка: " << e.what() << "\n";
            return 1;
        }
    

    return 0;
}
