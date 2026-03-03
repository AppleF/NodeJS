#include <stdio.h>

int main (void) {
 double x = 0.0, y = 0.0;
 int a = -1.0, b = 1.0;
 for (int i = 0; i < 10; i++) {
    x = a + (b-a)*(double) i/9;
    y = x*x;

    printf("%f %f\n", x, y);
}

return 0;
}
