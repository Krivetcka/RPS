#include <iostream>
#include <vector>
#include <cassert>
#include <sstream>
#include "CombSort.h"

using namespace std;

// Утилита: проверка равенства векторов
bool vectorsEqual(const vector<int>& a, const vector<int>& b) {
    if (a.size() != b.size()) return false;
    for (size_t i = 0; i < a.size(); ++i) {
        if (a[i] != b[i]) return false;
    }
    return true;
}

// Утилита: вывод вектора (для отладки)
void printVector(const vector<int>& v) {
    cout << "{";
    for (size_t i = 0; i < v.size(); ++i) {
        cout << v[i];
        if (i < v.size() - 1) cout << ", ";
    }
    cout << "}";
}

// Макрос для запуска теста с подробной диагностикой
#define RUN_TEST(testFunc) \
    do { \
        cout << "Тест " << #testFunc << ": "; \
        try { \
            testFunc(); \
            cout << "Успешно\n"; \
        } catch (const exception& e) { \
            cout << "- Провал " << e.what() << "\n"; \
        } catch (...) { \
            cout << "Провал - Неизвестная ошибка\n"; \
        } \
    } while (0)

// Тестовые функции

void testEmptyArray() {
    vector<int> arr = {};
    combSort(arr);
    if (!vectorsEqual(arr, vector<int>{})) {
        stringstream ss;
        cout << "Ожидалось {}, получилось ";
        printVector(arr);
        throw runtime_error(ss.str());
    }
}

void testSingleElement() {
    vector<int> arr = { 42 };
    combSort(arr);
    if (!vectorsEqual(arr, vector<int>{42})) {
        stringstream ss;
        cout << "Ожидалось {42}, получилось ";
        printVector(arr);
        throw runtime_error(ss.str());
    }
}

void testTwoElementsSorted() {
    vector<int> arr = { 1, 2 };
    combSort(arr);
    if (!vectorsEqual(arr, vector<int>{1, 2})) {
        stringstream ss;
        cout << "Ожидалось {1, 2}, получилось ";
        printVector(arr);
        throw runtime_error(ss.str());
    }
}

void testTwoElementsUnsorted() {
    vector<int> arr = { 2, 1 };
    combSort(arr);
    if (!vectorsEqual(arr, vector<int>{1, 2})) {
        stringstream ss;
        cout << "Ожидалось {1, 2}, получилось ";
        printVector(arr);
        throw runtime_error(ss.str());
    }
}

void testAlreadySorted() {
    vector<int> arr = { 1, 2, 3, 4, 5 };
    combSort(arr);
    if (!vectorsEqual(arr, vector<int>{1, 2, 3, 4, 5})) {
        stringstream ss;
        cout << "Ожидалось {1, 2, 3, 4, 5}, получилось ";
        printVector(arr);
        throw runtime_error(ss.str());
    }
}

void testReverseSorted() {
    vector<int> arr = { 5, 4, 3, 2, 1 };
    combSort(arr);
    if (!vectorsEqual(arr, vector<int>{1, 2, 3, 4, 5})) {
        stringstream ss;
        cout << "Ожидалось {1, 2, 3, 4, 5}, получилось ";
        printVector(arr);
        throw runtime_error(ss.str());
    }
}

void testDuplicateElements() {
    vector<int> arr = { 3, 1, 4, 1, 5, 9, 2, 6, 5 };
    combSort(arr);
    vector<int> expected = { 1, 1, 2, 3, 4, 5, 5, 6, 9 };
    if (!vectorsEqual(arr, expected)) {
        stringstream ss;
        cout << "Ожидалось ";
        printVector(expected);
        cout << ", получилось ";
        printVector(arr);
        throw runtime_error(ss.str());
    }
}

void testNegativeNumbers() {
    vector<int> arr = { -5, 3, -1, 0, 2, -10 };
    combSort(arr);
    vector<int> expected = { -10, -5, -1, 0, 2, 3 };
    if (!vectorsEqual(arr, expected)) {
        stringstream ss;
        cout << "Ожидалось ";
        printVector(expected);
        cout << ", получилось ";
        printVector(arr);
        throw runtime_error(ss.str());
    }
}

void testAllSameElements() {
    vector<int> arr = { 7, 7, 7, 7 };
    combSort(arr);
    if (!vectorsEqual(arr, vector<int>{7, 7, 7, 7})) {
        stringstream ss;
        cout << "Ожидалось {7, 7, 7, 7}, получилось ";
        printVector(arr);
        throw runtime_error(ss.str());
    }
}

void testLargeNumbers() {
    vector<int> arr = { 1000000, 500000, 750000 };
    combSort(arr);
    vector<int> expected = { 500000, 750000, 1000000 };
    if (!vectorsEqual(arr, expected)) {
        stringstream ss;
        cout << "Ожидалось ";
        printVector(expected);
        cout << ", получилось ";
        printVector(arr);
        throw runtime_error(ss.str());
    }
}

void testMixedPositiveNegative() {
    vector<int> arr = { -100, 50, -25, 75, 0 };
    combSort(arr);
    vector<int> expected = { -100, -25, 0, 50, 75 };
    if (!vectorsEqual(arr, expected)) {
        stringstream ss;
        cout << "Ожидалось ";
        printVector(expected);
        cout << ", получилось ";
        printVector(arr);
        throw runtime_error(ss.str());
    }
}

int Test() {
    cout << "=== Тесты ===\n";

    RUN_TEST(testEmptyArray);
    RUN_TEST(testSingleElement);
    RUN_TEST(testTwoElementsSorted);
    RUN_TEST(testTwoElementsUnsorted);
    RUN_TEST(testAlreadySorted);
    RUN_TEST(testReverseSorted);
    RUN_TEST(testDuplicateElements);
    RUN_TEST(testNegativeNumbers);
    RUN_TEST(testAllSameElements);
    RUN_TEST(testLargeNumbers);
    RUN_TEST(testMixedPositiveNegative);

    cout << "\n=== Отчёт ===\n";
    cout << "Все тесты пройдены.\n";
    return 0;
}
