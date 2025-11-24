#include "CppUnitTest.h"
#include <algorithm>
#include "../Расческа/CombSort.h"
#include <vector>
#include <sstream>
#include <string>

using namespace std;

namespace Microsoft {
    namespace VisualStudio {
        namespace CppUnitTestFramework {
            template<>
            wstring ToString<vector<int>>(const vector<int>& vec) {
                wstring result = L"[";
                for (size_t i = 0; i < vec.size(); ++i) {
                    result += to_wstring(vec[i]);
                    if (i < vec.size() - 1) {
                        result += L", ";
                    }
                }
                result += L"]";
                return result;
            }
        }
    }
}


using namespace Microsoft::VisualStudio::CppUnitTestFramework;

namespace UnitTest1
{
	TEST_CLASS(UnitTest1)
	{
	public:
		
        // Тест для пустого массива
        TEST_METHOD(TestEmptyArray)
        {
            vector<int> arr;
            vector<int> expected;

            combSort(arr);
            Assert::IsTrue(arr.empty());
        }

        // Тест для массива из одного элемента
        TEST_METHOD(TestSingleElement)
        {
            vector<int> arr = { 42 };
            vector<int> expected = { 42 };

            combSort(arr);
            Assert::AreEqual(expected, arr);
        }

        // Тест для уже отсортированного массива
        TEST_METHOD(TestAlreadySorted)
        {
            vector<int> arr = { 1, 2, 3, 4, 5 };
            vector<int> expected = { 1, 2, 3, 4, 5 };

            combSort(arr);
            Assert::AreEqual(expected, arr);
        }

        // Тест для обратного порядка
        TEST_METHOD(TestReverseOrder)
        {
            vector<int> arr = { 5, 4, 3, 2, 1 };
            vector<int> expected = { 1, 2, 3, 4, 5 };

            combSort(arr);
            Assert::AreEqual(expected, arr);
        }

        // Тест для случайного массива
        TEST_METHOD(TestRandomArray)
        {
            vector<int> arr = { 34, 12, 45, 2, 9, 87, 3 };
            vector<int> expected = arr;
            sort(expected.begin(), expected.end());

            combSort(arr);
            Assert::AreEqual(expected, arr);
        }

        // Тест для массива с повторяющимися элементами
        TEST_METHOD(TestDuplicates)
        {
            vector<int> arr = { 5, 3, 5, 2, 3, 1, 5 };
            vector<int> expected = { 1, 2, 3, 3, 5, 5, 5 };

            combSort(arr);
            Assert::AreEqual(expected, arr);
        }
	};
}
