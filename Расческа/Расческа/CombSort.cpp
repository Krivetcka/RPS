#include "CombSort.h"
#include <algorithm>
#include <fstream>

void combSort(vector<int>& arr) {
    if (arr.size() <= 1) return;

    int n = arr.size();
    int gap = n;
    const double shrink = 1.3;
    bool swapped = true;

    while (gap > 1 || swapped) {
        // Уменьшаем зазор
        gap = static_cast<int>(gap / shrink);
        if (gap < 1) gap = 1;

        swapped = false;

        // Проход с текущим зазором
        for (int i = 0; i + gap < n; ++i) {
            if (arr[i] > arr[i + gap]) {
                swap(arr[i], arr[i + gap]);
                swapped = true;
            }
        }
    }
}
